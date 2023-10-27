import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import * as getPreSignedUrls from '../../../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';
import { config } from '../../../../../../src/shared/config.js';

const { cpf } = config;

describe('Unit | UseCase | get-cpf-presigned-urls ', function () {
  context('#getPreSignUrlsOfFilesModifiedAfter', function () {
    it('should pre sign files modified after a date', async function () {
      // given
      const date = '2022-03-01';
      const filesModifiedBeforeDate = [
        { Key: 'firstFile', LastModified: '2022-02-14' },
        { Key: 'secondFile', LastModified: '2022-02-17' },
      ];
      const filesModifiedAfterDate = [
        { Key: 'thirdFile', LastModified: '2022-03-01' },
        { Key: 'fourthFile', LastModified: '2022-03-04' },
      ];
      const listFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'listFiles');
      listFilesStub.resolves({ Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate] });
      const preSignFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'preSignFiles');

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
        preSignedExpiresIn: 3600,
      });

      // when
      await getPreSignedUrls.getPreSignedUrls({ date, dependencies: { S3ObjectStorageProvider } });

      // then
      expect(listFilesStub).to.have.been.calledOnce;
      expect(preSignFilesStub).to.have.been.calledWithExactly({
        keys: ['thirdFile', 'fourthFile'],
        expiresIn: 3600,
      });
    });

    it('should not pre signed url of files modified before a date', async function () {
      // given
      const date = '2022-03-01';
      const filesModifiedBeforeDate = [
        { Key: 'firstFile', LastModified: '2022-02-14' },
        { Key: 'secondFile', LastModified: '2022-02-17' },
      ];
      const filesModifiedAfterDate = [
        { Key: 'thirdFile', LastModified: '2022-03-01' },
        { Key: 'fourthFile', LastModified: '2022-03-04' },
      ];

      const listFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'listFiles');
      listFilesStub.resolves({
        Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate],
      });
      const preSignFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'preSignFiles');
      preSignFilesStub.resolves(['preSignedThirdFile', 'preSignedFourthFile']);

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      const result = await getPreSignedUrls.getPreSignedUrls({
        date,
        dependencies: { S3ObjectStorageProvider },
      });

      // then
      expect(result).to.deep.equals(['preSignedThirdFile', 'preSignedFourthFile']);
    });
  });
});
