import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import bluebird from 'bluebird';

const getS3Client = function ({ accessKeyId, secretAccessKey, endpoint, region }) {
  return new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    region,
  });
};

const startUpload = function ({ client, filename, bucket, readableStream }) {
  return new Upload({
    client,
    params: {
      Key: filename,
      Bucket: bucket,
      ContentType: 'gzip',
      Body: readableStream,
      partSize: 1024 * 1024 * 5,
    },
  });
};

const listFiles = async function ({ client, bucket }) {
  return client.send(new ListObjectsV2Command({ Bucket: bucket }));
};

const preSignFiles = async function ({ client, bucket, keys, expiresIn }) {
  return bluebird.mapSeries(keys, async (key) => {
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(client, getObjectCommand, { expiresIn });
  });
};

export { getS3Client, startUpload, listFiles, preSignFiles };
