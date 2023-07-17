import * as s3Utils from './s3-utils.js';
import { config } from '../../config.js';
import { logger } from '../logger.js';
const { cpf } = config;

const upload = async function ({ filename, readableStream, dependencies = { s3Utils, logger } }) {
  dependencies.logger.trace('cpfExternalStorage: start upload');

  const { accessKeyId, secretAccessKey, endpoint, region, bucket } = cpf.storage;
  const s3Client = dependencies.s3Utils.getS3Client({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
  });

  const upload = dependencies.s3Utils.startUpload({
    client: s3Client,
    filename,
    bucket,
    readableStream,
  });

  upload.on('httpUploadProgress', (progress) => dependencies.logger.trace(progress));

  await upload.done();
  dependencies.logger.trace(`cpfExternalStorage: ${filename} upload done`);
};

const getPreSignUrlsOfFilesModifiedAfter = async function ({ date, dependencies = { s3Utils } }) {
  const { accessKeyId, secretAccessKey, endpoint, region, bucket, preSignedExpiresIn: expiresIn } = cpf.storage;
  const s3Client = dependencies.s3Utils.getS3Client({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
  });

  const filesInBucket = await dependencies.s3Utils.listFiles({ client: s3Client, bucket });

  const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
    ({ Key }) => Key,
  );

  return await dependencies.s3Utils.preSignFiles({
    client: s3Client,
    bucket,
    keys: keysOfFilesModifiedAfter,
    expiresIn,
  });
};

export { upload, getPreSignUrlsOfFilesModifiedAfter };
