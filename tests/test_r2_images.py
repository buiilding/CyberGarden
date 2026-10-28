import unittest
from unittest.mock import patch
from urllib.parse import urlsplit, parse_qs
from r2_images import R2Images, ImageError, MAX_IMAGE_BYTES

FIXTURE_ENV = {'R2_ACCOUNT_ID':'a'*32,'R2_BUCKET_NAME':'cybergarden-images','R2_ACCESS_KEY_ID':'fixture-access','R2_SECRET_ACCESS_KEY':'fixture-secret','R2_PUBLIC_BASE_URL':'https://pub-fixture.r2.dev'}

class R2ImageTests(unittest.TestCase):
    def service(self):
        with patch.dict('os.environ', FIXTURE_ENV, clear=True): return R2Images()

    def test_signature_is_short_lived_and_restricts_type_size_and_key(self):
        result=self.service().presign('image/png',128)
        target=urlsplit(result['uploadURL']); query=parse_qs(target.query)
        self.assertEqual(target.netloc,'a'*32+'.r2.cloudflarestorage.com')
        self.assertRegex(target.path,r'^/cybergarden-images/images/[a-f0-9]{32}\.png$')
        self.assertEqual(query['X-Amz-Expires'],['300'])
        self.assertIn('content-type',query['X-Amz-SignedHeaders'][0])
        self.assertIn('content-length',query['X-Amz-SignedHeaders'][0])
        self.assertTrue(result['publicURL'].startswith('https://pub-fixture.r2.dev/images/'))
        self.assertNotIn('?',result['publicURL'])
        self.assertNotIn('fixture-secret',repr(result))
        self.assertNotIn('fixture-access',repr(self.service().public_config()))

    def test_rejects_oversize_unsafe_types_and_invalid_configuration(self):
        service=self.service()
        for kind,size in [('image/svg+xml',100),('text/html',100),('image/png',0),('image/png',MAX_IMAGE_BYTES+1),('image/png','no')]:
            with self.assertRaises(ImageError): service.presign(kind,size)
        with patch.dict('os.environ',{},clear=True):
            with self.assertRaises(ImageError):R2Images().presign('image/png',128)
        with patch.dict('os.environ',{**FIXTURE_ENV,'R2_PUBLIC_BASE_URL':'https://user:secret@example.com'},clear=True):
            with self.assertRaises(ValueError):R2Images()
