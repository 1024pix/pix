import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';

describe('Unit | Infrastructure | storage | providers | S3ObjectStorageProvider', function () {
  const S3_CONFIG = {
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    endpoint: 'endpoint',
    region: 'region',
    bucket: 'pix-cpf-dev',
  };

  let clientS3;
  let libStorage;
  let s3RequestPresigner;
  beforeEach(function () {
    clientS3 = { S3Client, ListObjectsV2Command, GetObjectCommand };
    libStorage = { Upload };
    s3RequestPresigner = { getSignedUrl };
  });

  context('it should create a S3 Object Storage provider', function () {
    it('should inform when it is created without the required provider configuration', async function () {
      // given
      const loggerStub = sinon.stub(logger, 'warn');
      const badS3Config = { contains: 'not_the_right_config' };

      // when
      S3ObjectStorageProvider.createClient(badS3Config);

      // then
      expect(loggerStub).to.have.been.calledWithExactly('Invalid S3 configuration provided');
    });

    it('should create a provider', async function () {
      // given, when
      const client = S3ObjectStorageProvider.createClient(S3_CONFIG);

      // then
      expect(client).to.exist;
    });
  });

  context('#startUpload', function () {
    it('should call done() when the upload is successfully completed', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);
      const UploadStubbedInstance = sinon.createStubInstance(Upload);
      const constructorStub = sinon.stub(libStorage, 'Upload').returns(UploadStubbedInstance);
      const s3ObjectStorageProvider = S3ObjectStorageProvider.createClient({
        ...S3_CONFIG,
        dependencies: { clientS3, libStorage },
      });
      const readableStreamStub = sinon.stub();

      // when
      await s3ObjectStorageProvider.startUpload({
        filename: 'tales_of_villain.gzip',
        readableStream: readableStreamStub,
      });

      // then
      expect(constructorStub).to.have.been.calledWithMatch({
        client: S3ClientStubbedInstance,
        params: {
          Key: 'tales_of_villain.gzip',
          Bucket: 'pix-cpf-dev',
          ContentType: 'gzip',
          Body: readableStreamStub,
          partSize: 1024 * 1024 * 5,
        },
      });

      expect(UploadStubbedInstance.done).to.have.been.called;
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

      const s3ObjectStorageProvider = S3ObjectStorageProvider.createClient({
        ...S3_CONFIG,
        dependencies: { clientS3, libStorage },
      });

      // when
      const listFilesResult = await s3ObjectStorageProvider.listFiles();

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        Bucket: 'pix-cpf-dev',
      });
      expect(S3ClientStubbedInstance.send).to.have.been.calledWithExactly(ListObjectsV2CommandStubbedInstance);
      expect(listFilesResult).to.deep.equal({ Contents: [{ Key: 'hyperdimension_galaxy' }] });
    });
  });

  context('#preSignFile', function () {
    it('should sign file', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      const getObjectCommandStubbedInstance = sinon.createStubInstance(GetObjectCommand);
      const constructorStub = sinon.stub(clientS3, 'GetObjectCommand').returns(getObjectCommandStubbedInstance);
      sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);

      const getSignedUrlStub = sinon.stub(s3RequestPresigner, 'getSignedUrl');
      getSignedUrlStub
        .withArgs(S3ClientStubbedInstance, getObjectCommandStubbedInstance, { expiresIn: 3600 })
        .resolves('presigned_we_love_sweets');

      const s3ObjectStorageProvider = S3ObjectStorageProvider.createClient({
        ...S3_CONFIG,
        dependencies: { clientS3, s3RequestPresigner },
      });

      // when
      const result = await s3ObjectStorageProvider.preSignFile({
        key: { Key: 'we_love_sweets' },
        expiresIn: 3600,
      });

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        Bucket: 'pix-cpf-dev',
        Key: { Key: 'we_love_sweets' },
      });
      expect(getSignedUrlStub).to.have.been.calledOnce;
      expect(result).to.deep.equal('presigned_we_love_sweets');
    });
  });

  context('#readFile', function () {
    it('should return a S3 Object', async function () {
      // given
      const S3ClientStubbedInstance = sinon.createStubInstance(S3Client);
      const fakeStream = sinon.stub();
      S3ClientStubbedInstance.send.resolves({ Body: fakeStream });
      const GetObjectCommandStubbedInstance = sinon.createStubInstance(GetObjectCommand);
      const constructorStub = sinon.stub(clientS3, 'GetObjectCommand').returns(GetObjectCommandStubbedInstance);
      sinon.stub(clientS3, 'S3Client').returns(S3ClientStubbedInstance);

      const s3ObjectStorageProvider = S3ObjectStorageProvider.createClient({
        ...S3_CONFIG,
        dependencies: { clientS3 },
      });

      // when
      const readFileResult = await s3ObjectStorageProvider.readFile({ key: 'be_the_gal' });

      // then
      expect(constructorStub).to.have.been.calledWithExactly({
        Bucket: 'pix-cpf-dev',
        Key: 'be_the_gal',
      });
      expect(S3ClientStubbedInstance.send).to.have.been.calledWithExactly(GetObjectCommandStubbedInstance);
      expect(readFileResult).to.deep.equal({ Body: fakeStream });
    });
  });
});
