import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = () => ({
  async get({ settings, objectName }) {
    const s3 = new S3Client({
      endpoint: settings.endpoint,
      credentials: {
        accessKeyId: settings.accessKey,
        secretAccessKey: settings.secretKey,
      },
      forcePathStyle: settings.forcePathStyle,
    });

    const command = new GetObjectCommand({
      Bucket: settings.bucket,
      Key: objectName,
    });

    return getSignedUrl(s3, command, { expiresIn: 15 * 60 });
  },
});

export default bucket;
