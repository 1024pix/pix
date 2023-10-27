import { expect, sinon, catchErrSync } from '../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../lib/infrastructure/external-storage/s3-utils.js';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

describe('Unit | Infrastructure | external-storage | s3-utils', function () {
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
    it('should return an error without the required provider configuration', async function () {
      // given
      const badS3Config = { contains: 'not_the_right_config' };

      // when
      const error = catchErrSync((context) => S3ObjectStorageProvider.createClient(context))(badS3Config);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Missing S3 Object Storage configuration');
    });

    it('should create a provider', async function () {
      // given, when
      const client = S3ObjectStorageProvider.createClient(S3_CONFIG);

      // then
      expect(client).to.exist;
    });
  });

  context('#startUpload', function () {
    it('should return an upload client', async function () {
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
      const uploadClient = s3ObjectStorageProvider.startUpload({
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

      const s3ObjectStorageProvider = S3ObjectStorageProvider.createClient({
        ...S3_CONFIG,
        dependencies: { clientS3, s3RequestPresigner },
      });

      const preSignFilesConfig = {
        keys: [{ Key: 'we_love_sweets' }],
        expiresIn: 3600,
      };

      // when
      const result = await s3ObjectStorageProvider.preSignFiles({
        ...preSignFilesConfig,
      });

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
