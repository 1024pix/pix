import sinon from 'sinon';

import { AnswersHistoryExportStorage } from '../../../scripts/prod/answers-history-export-storage.js';
import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { expect } from '../../test-helper.js';

describe('Unit | Storage | AnswerHistoryExportsStorage', function () {
  describe('constructor', function () {
    it('should create a S3 client', async function() {
      // given
      const clientStub = sinon.stub(S3ObjectStorageProvider, 'createClient');
      sinon.stub(process.env, 'ANSWERS_HISTORY_EXPORT_STORAGE_ACCESS_KEY_ID').value(1);
      sinon.stub(process.env, 'ANSWERS_HISTORY_EXPORT_STORAGE_SECRET_ACCESS_KEY').value(2);
      sinon.stub(process.env, 'ANSWERS_HISTORY_EXPORT_STORAGE_ENDPOINT').value(3);
      sinon.stub(process.env, 'ANSWERS_HISTORY_EXPORT_STORAGE_REGION').value(4);
      sinon.stub(process.env, 'ANSWERS_HISTORY_EXPORT_STORAGE_BUCKET_NAME').value(5);
      // when
      new AnswersHistoryExportStorage();

      // then
      expect(clientStub).to.have.been.calledWithExactly({
        accessKeyId: '1',
        secretAccessKey: '2',
        endpoint: '3',
        region: '4',
        bucket: '5',
        forcePathStyle: true,
      });
      sinon.restore();
    });
  });
});
