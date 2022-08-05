const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

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
};
