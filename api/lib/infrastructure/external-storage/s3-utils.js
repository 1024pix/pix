import * as clientS3 from '@aws-sdk/client-s3';
import * as libStorage from '@aws-sdk/lib-storage';
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner';

import bluebird from 'bluebird';

class S3ObjectStorageProvider {
  #dependencies;
  #s3Client;
  #bucket;

  constructor({ credentials, endpoint, region, bucket, dependencies = { clientS3, libStorage, s3RequestPresigner } }) {
    this.#dependencies = dependencies;

    this.#s3Client = new dependencies.clientS3.S3Client({
      credentials,
      endpoint,
      region,
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
  }) {
    if (Object.values({ accessKeyId, secretAccessKey, endpoint, region, bucket }).some((prop) => prop === undefined)) {
      throw new Error('Missing S3 Object Storage configuration');
    }

    return new S3ObjectStorageProvider({
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      region,
      bucket,
      dependencies,
    });
  }

  startUpload({ filename, readableStream }) {
    return new this.#dependencies.libStorage.Upload({
      client: this.#s3Client,
      params: {
        Key: filename,
        Bucket: this.#bucket,
        ContentType: 'gzip',
        Body: readableStream,
        partSize: 1024 * 1024 * 5,
      },
    });
  }

  async listFiles() {
    return this.#s3Client.send(new this.#dependencies.clientS3.ListObjectsV2Command({ Bucket: this.#bucket }));
  }

  async preSignFiles({ keys, expiresIn }) {
    return bluebird.mapSeries(keys, async (key) => {
      const getObjectCommand = this.#dependencies.clientS3.GetObjectCommand({ Bucket: this.#bucket, Key: key });
      return this.#dependencies.s3RequestPresigner.getSignedUrl(this.#s3Client, getObjectCommand, { expiresIn });
    });
  }
}

export { S3ObjectStorageProvider };
