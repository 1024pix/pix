const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { cpf } = require('../../config');
const logger = require('../logger');

module.exports = {
  upload: function ({ filename, writableStream }) {
    const { accessKeyId, secretAccessKey, endpoint, region, bucket } = cpf.storage;
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      region,
    });

    const upload = new Upload({
      client: s3Client,
      params: { Key: filename, Bucket: bucket, ContentType: 'text/xml', Body: writableStream },
    });

    upload.on('httpUploadProgress', (progress) => logger.trace(progress));

    upload.done();
  },
};
