// Server-only helper. Receive credentials on stdin, never argv or browser code.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
let raw = '';
for await (const chunk of process.stdin) { raw += chunk; if (raw.length > 16384) process.exit(1); }
try {
  const { accountId, accessKeyId, secretAccessKey, bucket, key, type, size } = JSON.parse(raw);
  const client = new S3Client({
    region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }, requestChecksumCalculation: 'WHEN_REQUIRED',
  });
  const uploadURL = await getSignedUrl(client, new PutObjectCommand({
    Bucket: bucket, Key: key, ContentType: type, ContentLength: size,
  }), { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length']) });
  process.stdout.write(JSON.stringify({ uploadURL }));
} catch { process.stderr.write('Unable to sign image upload.\n'); process.exitCode = 1; }
