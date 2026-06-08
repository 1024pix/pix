import * as clientS3 from '@aws-sdk/client-s3';
import * as libStorage from '@aws-sdk/lib-storage';
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner';

import { logger } from '../../../infrastructure/utils/logger.js';

class S3ObjectStorageProvider {
  #dependencies;
  #s3Client;
  #bucket;

  constructor({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
    bucket,
    dependencies = { clientS3, libStorage, s3RequestPresigner, logger },
    forcePathStyle = false,
  }) {
    if ([accessKeyId, secretAccessKey, endpoint, region, bucket].some((prop) => prop === undefined)) {
      logger.warn('Invalid S3 configuration provided');
    }

    this.#dependencies = dependencies;

    this.#s3Client = new dependencies.clientS3.S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      region,
      forcePathStyle,
    });

    this.#bucket = bucket;
  }

  static createClient({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
    bucket,
    dependencies = { clientS3, libStorage, s3RequestPresigner },
    forcePathStyle,
  }) {
    return new S3ObjectStorageProvider({
      accessKeyId,
      secretAccessKey,
      endpoint,
      region,
      bucket,
      dependencies: { clientS3, libStorage, s3RequestPresigner, logger, ...dependencies },
      forcePathStyle,
    });
  }

  async startUpload({ filename, readableStream }) {
    const upload = new this.#dependencies.libStorage.Upload({
      client: this.#s3Client,
      params: {
        Key: filename,
        Bucket: this.#bucket,
        ContentType: 'gzip',
        Body: readableStream,
        partSize: 1024 * 1024 * 5,
      },
    });

    upload.on('httpUploadProgress', (progress) => this.#dependencies.logger.trace(progress));
    return upload.done();
  }

  async listFiles({ prefix, continuationToken } = {}) {
    const params = { Bucket: this.#bucket };
    if (prefix) params.Prefix = prefix;
    if (continuationToken) params.ContinuationToken = continuationToken;
    return this.#s3Client.send(new this.#dependencies.clientS3.ListObjectsV2Command(params));
  }

  async preSignFile({ key, expiresIn }) {
    const getObjectCommand = new this.#dependencies.clientS3.GetObjectCommand({ Bucket: this.#bucket, Key: key });
    return this.#dependencies.s3RequestPresigner.getSignedUrl(this.#s3Client, getObjectCommand, { expiresIn });
  }

  async readFile({ key }) {
    const getObjectCommand = new this.#dependencies.clientS3.GetObjectCommand({ Bucket: this.#bucket, Key: key });
    return this.#s3Client.send(getObjectCommand);
  }

  async deleteFile({ key }) {
    const deleteObjectCommand = new this.#dependencies.clientS3.DeleteObjectCommand({ Bucket: this.#bucket, Key: key });
    return this.#s3Client.send(deleteObjectCommand);
  }
}

export { S3ObjectStorageProvider };
