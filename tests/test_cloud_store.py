import json
import unittest
from unittest.mock import patch
from cryptography.fernet import Fernet
from cloud_store import CloudStore, StoreError, validate_page
from auth import AuthService, Config
from youtube_upload import YouTubeService


class Result:
    def __init__(self,value=None): self.value=value
    def fetchone(self): return self.value

class Database:
    def __init__(self): self.rows={};self.ciphertext=None;self.statements=[]
    def __enter__(self): return self
    def __exit__(self,*args): pass
    def execute(self,sql,params=None):
        self.statements.append(sql)
        if sql.startswith('select ciphertext'):return Result((self.ciphertext,)) if self.ciphertext else Result()
        if sql.startswith('insert into cybergarden.runtime'):self.ciphertext=params[0]
        if sql.startswith('insert into cybergarden.pages'):
            key,doc=params
            if key in self.rows:return Result()
            self.rows[key]=(json.loads(doc),1);return Result((1,))
        if sql.startswith('update cybergarden.pages'):
            doc,key,revision=params
            if key not in self.rows or self.rows[key][1]!=revision:return Result()
            self.rows[key]=(json.loads(doc),revision+1);return Result((revision+1,))
        return Result()

class CloudStoreTests(unittest.TestCase):
    def setUp(self):
        with patch.dict('os.environ',{'DATABASE_URL':'fixture','SESSION_ENCRYPTION_KEY':Fernet.generate_key().decode()}):self.store=CloudStore()
        self.db=Database();self.store.connect=lambda:self.db

    def test_sessions_survive_instance_restart_and_ciphertext_contains_no_tokens(self):
        config=Config('http://localhost:4183','','',frozenset())
        first=AuthService(config);youtube=YouTubeService(config.origin)
        with self.store.runtime(first,youtube):
            first.sessions['id']={'access':'private-token','deadline':9999999999}
            first.connections['owner']={'refresh':'private-refresh-token'}
            youtube.flows['state']={'verifier':'private-verifier'}
        self.assertNotIn('private',self.db.ciphertext)
        fresh=AuthService(config);fresh_youtube=YouTubeService(config.origin)
        with self.store.runtime(fresh,fresh_youtube):
            self.assertEqual(fresh.sessions['id']['access'],'private-token')
            self.assertEqual(fresh.connections['owner']['refresh'],'private-refresh-token')
            self.assertEqual(fresh_youtube.flows['state']['verifier'],'private-verifier')
            fresh.sessions.pop('id')
        with self.store.runtime(first,youtube):self.assertNotIn('id',first.sessions)
        self.assertTrue(any('advisory_xact_lock' in sql for sql in self.db.statements))

    def test_stale_writes_cannot_overwrite_newer_pages(self):
        page={'id':'note','title':'Hi','markdown':'old'}
        first=self.store.save_page(page)
        self.assertEqual(first['_revision'],1)
        saved=self.store.save_page({**first,'markdown':'new'})
        self.assertEqual(saved['_revision'],2)
        with self.assertRaises(StoreError) as context:self.store.save_page({**first,'markdown':'stale'})
        self.assertEqual(context.exception.status,409)
        self.assertEqual(self.db.rows['note'][0]['markdown'],'new')

    def test_invalid_pages_and_home_deletion_are_rejected(self):
        for page in [{'id':'../escape'}, {'id':'note','title':'Hi'}, {'id':'__garden_home__','deleted':True}, {'id':'note','title':'Hi','markdown':'x'*(1024*1024+1)}]:
            with self.assertRaises(StoreError):validate_page(page)
