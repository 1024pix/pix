import * as clientS3 from '@aws-sdk/client-s3';
import * as libStorage from '@aws-sdk/lib-storage';
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner';

import bluebird from 'bluebird';

const getS3Client = function ({ accessKeyId, secretAccessKey, endpoint, region, dependencies = { clientS3 } }) {
  return new dependencies.clientS3.S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    region,
  });
};

const startUpload = function ({ client, filename, bucket, readableStream, dependencies = { libStorage } }) {
  return new dependencies.libStorage.Upload({
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

const listFiles = async function ({ client, bucket, dependencies = { clientS3 } }) {
  return client.send(new dependencies.clientS3.ListObjectsV2Command({ Bucket: bucket }));
};

const preSignFiles = async function ({
  client,
  bucket,
  keys,
  expiresIn,
  dependencies = { clientS3, s3RequestPresigner },
}) {
  return bluebird.mapSeries(keys, async (key) => {
    const getObjectCommand = new dependencies.clientS3.GetObjectCommand({ Bucket: bucket, Key: key });
    return await dependencies.s3RequestPresigner.getSignedUrl(client, getObjectCommand, { expiresIn });
  });
};

export { getS3Client, startUpload, listFiles, preSignFiles };
