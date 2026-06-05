import { Readable } from "node:stream";

import sinon from 'sinon';

import { AnswersHistoryExportStorage } from '../../../scripts/prod/answers-history-export-storage.js';
import { FileValidationError } from "../../../src/shared/domain/errors.js";
import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { expect } from '../../test-helper.js';
import { catchErr } from "../../tooling/test-utils/error.js";

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

  describe('sendFile', function () {
    it('should send a file', async function() {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const answersHistoryExportStorage = new AnswersHistoryExportStorage();
      providerStub.startUpload.resolves();
      const fileContent = new ArrayBuffer(1);

      // when
      await answersHistoryExportStorage.sendFile({
        filename: 'hey.gz',
        fileContent: fileContent,
      });

      // then
      const actualReadableStream = providerStub.startUpload.firstCall.args[0].readableStream;
      expect(providerStub.startUpload).to.have.been.calledWith(sinon.match({
        filename: 'hey.gz',
        readableStream: sinon.match.instanceOf(Readable),
      }));
      await _compareReadableStreamToFileContent(actualReadableStream, fileContent);
    });

    describe('when file content is invalid', function () {
      it('should throw an error', async function() {
        // given
        const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
        sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
        const answersHistoryExportStorage = new AnswersHistoryExportStorage();
        providerStub.startUpload.resolves();

        // when
        const error = await catchErr(answersHistoryExportStorage.sendFile)({
          filename: 'hey.gz',
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.message).to.equal('An error occurred, file is invalid');
      })
    });
  });
});

async function _compareReadableStreamToFileContent(readableStream, fileContent) {
  const actualStream = readableStream;
  const actualStreamChucks = [];
  for await (const chunk of actualStream) {
    actualStreamChucks.push(chunk);
  }
  expect(Buffer.concat(actualStreamChucks)).to.deep.equal(Buffer.from(fileContent));
}
