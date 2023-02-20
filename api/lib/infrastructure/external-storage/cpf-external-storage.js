import s3Utils from './s3-utils';
import { cpf } from '../../config';
import logger from '../logger';

export default {
  upload: async function ({ filename, readableStream }) {
    logger.trace('cpfExternalStorage: start upload');

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
      readableStream,
    });

    upload.on('httpUploadProgress', (progress) => logger.trace(progress));

    await upload.done();
    logger.trace(`cpfExternalStorage: ${filename} upload done`);
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
