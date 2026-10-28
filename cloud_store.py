"""Supabase Postgres persistence behind the owner-authenticated server."""
from contextlib import contextmanager
import json
import math
import os
from pathlib import Path
import re

MAX_PAGE_BYTES = 1024 * 1024


class StoreError(Exception):
    def __init__(self, message='Cloud storage is unavailable. Try again.', status=503):
        super().__init__(message)
        self.status = status


def validate_page(value):
    if not isinstance(value, dict) or not isinstance(value.get('id'), str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', value['id']):
        raise StoreError('Invalid page ID.', 400)
    if value.get('deleted') is True:
        if value['id'] == '__garden_home__':
            raise StoreError('Home cannot be deleted.', 400)
        return {'id': value['id'], 'deleted': True}
    if not isinstance(value.get('title'), str) or not isinstance(value.get('markdown'), str):
        raise StoreError('A page needs a title and Markdown content.', 400)
    if len(value['title']) > 1000 or len(value['markdown'].encode()) > MAX_PAGE_BYTES:
        raise StoreError('This page is too large to save.', 413)
    doc = {k: value[k] for k in ['id', 'title', 'markdown', 'related', 'order'] if k in value}
    if 'order' in doc and (type(doc['order']) not in (int, float) or not math.isfinite(doc['order']) or abs(doc['order']) > 10000000):
        raise StoreError('Invalid page order.', 400)
    if 'related' in doc and (not isinstance(doc['related'], str) or len(doc['related']) > 100):
        doc.pop('related')
    return doc


class CloudStore:
    def __init__(self):
        self.url = os.environ.get('DATABASE_URL', '')
        self.key = os.environ.get('SESSION_ENCRYPTION_KEY', '')
        self.configured = bool(self.url)
        if self.configured:
            from cryptography.fernet import Fernet
            try:
                self.cipher = Fernet(self.key.encode())
            except Exception:
                raise ValueError('Set a valid SESSION_ENCRYPTION_KEY before enabling cloud storage.') from None

    def connect(self):
        import psycopg
        # Supabase's transaction pooler does not support prepared statements.
        return psycopg.connect(self.url, sslmode='require', prepare_threshold=None, connect_timeout=10)

    def initialize(self):
        with self.connect() as connection:
            connection.execute((Path(__file__).parent / 'db/schema.sql').read_text(), prepare=False)

    @contextmanager
    def runtime(self, auth, youtube):
        if not self.configured:
            yield
            return
        try:
            with self.connect() as connection:
                # Serialize token rotation and consume OAuth state once across instances.
                connection.execute("set local lock_timeout = '25s'")
                connection.execute('select pg_advisory_xact_lock(719307112)')
                row = connection.execute("select ciphertext from cybergarden.runtime where id='auth'").fetchone()
                state = json.loads(self.cipher.decrypt(row[0].encode())) if row else {}
                auth.flows = state.get('flows', {})
                auth.sessions = state.get('sessions', {})
                auth.connections = state.get('connections', {})
                youtube.flows = state.get('youtube_flows', {})
                try:
                    yield
                finally:
                    auth.prune()
                    ciphertext = self.cipher.encrypt(json.dumps({
                        'flows': auth.flows, 'sessions': auth.sessions, 'connections': auth.connections,
                        'youtube_flows': youtube.flows,
                    }).encode()).decode()
                    connection.execute("insert into cybergarden.runtime(id,ciphertext) values ('auth',%s) on conflict(id) do update set ciphertext=excluded.ciphertext,updated_at=now()", (ciphertext,))
        except (StoreError,):
            raise
        except Exception:
            raise StoreError() from None

    def list_pages(self):
        try:
            with self.connect() as connection:
                rows = connection.execute('select document,revision from cybergarden.pages order by updated_at,id').fetchall()
            return [{**doc, '_revision': revision} for doc, revision in rows]
        except Exception:
            raise StoreError() from None

    def save_page(self, value):
        doc = validate_page(value)
        revision = value.get('_revision', 0)
        if type(revision) is not int or revision < 0:
            raise StoreError('Invalid page revision.', 400)
        try:
            with self.connect() as connection:
                if revision == 0:
                    row = connection.execute('insert into cybergarden.pages(id,document) values(%s,%s::jsonb) on conflict do nothing returning revision', (doc['id'], json.dumps(doc))).fetchone()
                else:
                    row = connection.execute('update cybergarden.pages set document=%s::jsonb,revision=revision+1,updated_at=now() where id=%s and revision=%s returning revision', (json.dumps(doc), doc['id'], revision)).fetchone()
                if not row:
                    raise StoreError('This page changed in another tab or device. Export your changes, then reload before saving again.', 409)
            return {**doc, '_revision': row[0]}
        except StoreError:
            raise
        except Exception:
            raise StoreError() from None

    def import_pages(self, values):
        if not isinstance(values, list) or not 1 <= len(values) <= 500:
            raise StoreError('Import 1–500 pages at a time.', 400)
        docs = [validate_page(v) for v in values]
        if len({d['id'] for d in docs}) != len(docs):
            raise StoreError('Duplicate page IDs.', 400)
        # Pending media must finish locally before pages leave this browser.
        if any(re.search(r'\]\((?:\.?/?assets/)', d.get('markdown', '')) for d in docs):
            raise StoreError('Some pages still reference local media. Upload those images/videos or remove them before importing.', 409)
        try:
            with self.connect() as connection:
                connection.execute('lock table cybergarden.pages in exclusive mode')
                if connection.execute('select 1 from cybergarden.pages limit 1').fetchone():
                    raise StoreError('The cloud garden already contains pages. Import was stopped to preserve them.', 409)
                for doc in docs:
                    connection.execute('insert into cybergarden.pages(id,document) values(%s,%s::jsonb)', (doc['id'], json.dumps(doc)))
            return self.list_pages()
        except StoreError:
            raise
        except Exception:
            raise StoreError() from None
