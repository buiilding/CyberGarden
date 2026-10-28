"""Owner-authorized direct image uploads. R2 credentials never leave the server."""
import os
import re
import secrets
from urllib.parse import urlsplit

MAX_IMAGE_BYTES = 40 * 1024 * 1024
IMAGE_TYPES = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif'}


class ImageError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


class R2Images:
    def __init__(self):
        self.account = os.environ.get('R2_ACCOUNT_ID', '')
        self.bucket = os.environ.get('R2_BUCKET_NAME', '')
        self.access = os.environ.get('R2_ACCESS_KEY_ID', '')
        self.secret = os.environ.get('R2_SECRET_ACCESS_KEY', '')
        self.public_base = os.environ.get('R2_PUBLIC_BASE_URL', '').rstrip('/')
        if self.account and not re.fullmatch(r'[a-f0-9]{32}', self.account):
            raise ValueError('R2_ACCOUNT_ID must be the 32-character Cloudflare account ID.')
        if self.bucket and not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,61}[a-z0-9]', self.bucket):
            raise ValueError('R2_BUCKET_NAME must be a valid bucket name.')
        if self.public_base:
            parsed = urlsplit(self.public_base)
            if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path:
                raise ValueError('R2_PUBLIC_BASE_URL must be an HTTPS origin without a path.')

    @property
    def configured(self):
        return bool(self.account and self.bucket and self.access and self.secret and self.public_base)

    def public_config(self):
        return {'configured': self.configured, 'imageBaseURL': self.public_base, 'maxImageBytes': MAX_IMAGE_BYTES}

    def presign(self, content_type, size):
        if not self.configured:
            raise ImageError('Image uploads need Cloudflare R2 configuration. See README.md.', 503)
        try:
            size = int(size)
        except (TypeError, ValueError):
            raise ImageError('Invalid image size.') from None
        if content_type not in IMAGE_TYPES or not 0 < size <= MAX_IMAGE_BYTES:
            raise ImageError('Choose a PNG, JPEG, GIF, WebP, or AVIF image up to 40 MB.')
        key = f'images/{secrets.token_hex(16)}.{IMAGE_TYPES[content_type]}'
        try:
            import boto3
            from botocore.config import Config
            client = boto3.client('s3', endpoint_url=f'https://{self.account}.r2.cloudflarestorage.com', region_name='auto',
                aws_access_key_id=self.access, aws_secret_access_key=self.secret,
                config=Config(signature_version='s3v4', request_checksum_calculation='when_required', s3={'addressing_style':'path'}))
            upload_url = client.generate_presigned_url('put_object', Params={
                'Bucket': self.bucket, 'Key': key, 'ContentType': content_type, 'ContentLength': size,
            }, ExpiresIn=300, HttpMethod='PUT')
        except Exception:
            raise ImageError('Could not prepare image upload. Check R2 configuration and install requirements.txt.', 503) from None
        return {'uploadURL': upload_url, 'publicURL': f'{self.public_base}/{key}', 'contentType': content_type}
