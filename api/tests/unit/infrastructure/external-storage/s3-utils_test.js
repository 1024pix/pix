import { expect, sinon } from '../../../test-helper.js';
import {
  getS3Client,
  startUpload,
  listFiles,
  preSignFiles,
} from '../../../../lib/infrastructure/external-storage/s3-utils.js';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

describe('Unit | Infrastructure | external-storage | s3-utils', function () {
  let clientS3;
  let libStorage;
  let s3RequestPresigner;
  beforeEach(function () {
    clientS3 = { S3Client, ListObjectsV2Command, GetObjectCommand };
    libStorage = { Upload };
    s3RequestPresigner = { getSignedUrl };
  });

  context('#getS3Client', function () {
    it('should return a S3 client configured with the provided options', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      const constructorStub = sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);
      const config = {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      };

      // when
      const client = getS3Client({ ...config, dependencies: { clientS3 } });

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        credentials: { accessKeyId: 'accessKeyId', secretAccessKey: 'secretAccessKey' },
        endpoint: 'endpoint',
        region: 'region',
      });
      expect(client).to.equal(S3ClientStubbedInstance);
    });
  });

  context('#startUpload', function () {
    it('should return an upload client', async function () {
      // given
      const UploadStubbedInstance = sinon.createStubInstance(Upload);
      const constructorStub = sinon.stub(libStorage, 'Upload').returns(UploadStubbedInstance);
      const readableStreamStub = sinon.stub();
      const uploadConfig = {
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        filename: 'tales_of_villain.gzip',
        bucket: 'pix-cpf-dev',
        readableStream: readableStreamStub,
      };

      // when
      const uploadClient = startUpload({ ...uploadConfig, dependencies: { libStorage } });

      // then
      expect(constructorStub).to.have.been.calledWithMatch({
        params: {
          Key: 'tales_of_villain.gzip',
          Bucket: 'pix-cpf-dev',
          ContentType: 'gzip',
          Body: readableStreamStub,
          partSize: 1024 * 1024 * 5,
        },
      });

      expect(uploadClient).to.equal(UploadStubbedInstance);
    });
  });

  context('#listFiles', function () {
    it('should return a listing files client', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      S3ClientStubbedInstance.send.resolves({ Contents: [{ Key: 'hyperdimension_galaxy' }] });
      const ListObjectsV2CommandStubbedInstance = sinon.createStubInstance(ListObjectsV2Command);
      const constructorStub = sinon.stub(clientS3, 'ListObjectsV2Command').returns(ListObjectsV2CommandStubbedInstance);
      sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);
      const listFilesConfig = {
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        bucket: 'pix-cpf-dev',
      };

      // when
      const listFilesResult = await listFiles({ ...listFilesConfig, dependencies: { clientS3 } });

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        Bucket: 'pix-cpf-dev',
      });
      expect(S3ClientStubbedInstance.send).to.have.been.calledWithExactly(ListObjectsV2CommandStubbedInstance);
      expect(listFilesResult).to.deep.deep.equal({ Contents: [{ Key: 'hyperdimension_galaxy' }] });
    });
  });

  context('#preSignFiles', function () {
    it('should sign files', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      const getObjectCommandStubbedInstance = sinon.createStubInstance(GetObjectCommand);
      const constructorStub = sinon.stub(clientS3, 'GetObjectCommand').returns(getObjectCommandStubbedInstance);
      sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);

      const getSignedUrlStub = sinon.stub(s3RequestPresigner, 'getSignedUrl');

      getSignedUrlStub
        .withArgs(S3ClientStubbedInstance, getObjectCommandStubbedInstance, { expiresIn: 3600 })
        .resolves('presigned_we_love_sweets');

      const preSignFilesConfig = {
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        bucket: 'pix-cpf-dev',
        keys: [{ Key: 'we_love_sweets' }],
        expiresIn: 3600,
      };

      // when
      const result = await preSignFiles({ ...preSignFilesConfig, dependencies: { clientS3, s3RequestPresigner } });

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        Bucket: 'pix-cpf-dev',
        Key: { Key: 'we_love_sweets' },
      });
      expect(getSignedUrlStub).to.have.been.calledOnce;
      expect(result).to.deep.deep.equal(['presigned_we_love_sweets']);
    });
  });
});
