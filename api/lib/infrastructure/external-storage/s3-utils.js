const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const bluebird = require('bluebird');

module.exports = {
  getS3Client({ accessKeyId, secretAccessKey, endpoint, region }) {
    return new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      region,
    });
  },
  startUpload({ client, filename, bucket, writableStream }) {
    return new Upload({
      client,
      params: { Key: filename, Bucket: bucket, ContentType: 'text/xml', Body: writableStream },
    });
  },
  async listFiles({ client, bucket }) {
    return client.send(new ListObjectsV2Command({ Bucket: bucket }));
  },
  async preSignFiles({ client, bucket, keys, expiresIn }) {
    return bluebird.mapSeries(keys, async (key) => {
      const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      return await getSignedUrl(client, getObjectCommand, { expiresIn });
    });
  },
};
