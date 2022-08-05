const s3Utils = require('./s3-utils');
const { cpf } = require('../../config');
const logger = require('../logger');

module.exports = {
  upload: async function ({ filename, writableStream }) {
    const { accessKeyId, secretAccessKey, endpoint, region, bucket } = cpf.storage;
    const s3Client = s3Utils.getS3Client({
      accessKeyId,
      secretAccessKey,
      endpoint,
      region,
    });

    const upload = s3Utils.startUpload({
      client: s3Client,
      filename,
      bucket,
      writableStream,
    });

    upload.on('httpUploadProgress', (progress) => logger.trace(progress));

    await upload.done();
  },

  getPreSignUrlsOfFilesModifiedAfter: async function ({ date }) {
    const { accessKeyId, secretAccessKey, endpoint, region, bucket, preSignedExpiresIn: expiresIn } = cpf.storage;
    const s3Client = s3Utils.getS3Client({
      accessKeyId,
      secretAccessKey,
      endpoint,
      region,
    });

    const filesInBucket = await s3Utils.listFiles({ client: s3Client, bucket });

    const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
      ({ Key }) => Key
    );

    return await s3Utils.preSignFiles({ client: s3Client, bucket, keys: keysOfFilesModifiedAfter, expiresIn });
  },
};
