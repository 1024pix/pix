import { Readable } from 'node:stream';

import sinon from 'sinon';

import { AnswersHistoryRepository } from '../../../../../src/db-history/infrastructure/repositories/answers-history-repository.js';
import { FileValidationError } from '../../../../../src/shared/domain/errors.js';
import { S3ObjectStorageProvider } from '../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | History-db | Infrastructure | Repository | AnswersHistory', function () {
  describe('constructor', function () {
    it('should create a S3 client', async function () {
      // when
      const client = AnswersHistoryRepository.createClient();

      // then
      expect(client).to.be.instanceof(AnswersHistoryRepository);
    });
  });

  describe('sendFile', function () {
    it('should send a file', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const answersHistoryRepository = AnswersHistoryRepository.createClient();
      providerStub.startUpload.resolves();
      const fileContent = new ArrayBuffer(1);

      // when
      await answersHistoryRepository.sendFile({
        filename: 'hey.gz',
        fileContent: fileContent,
      });

      // then
      const actualReadableStream = providerStub.startUpload.firstCall.args[0].readableStream;
      expect(providerStub.startUpload).to.have.been.calledWith(
        sinon.match({
          filename: 'hey.gz',
          readableStream: sinon.match.instanceOf(Readable),
        }),
      );
      await _compareReadableStreamToFileContent(actualReadableStream, fileContent);
    });

    describe('when file content is invalid', function () {
      it('should throw an error', async function () {
        // given
        const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
        sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
        const answersHistoryRepository = AnswersHistoryRepository.createClient();
        providerStub.startUpload.resolves();

        // when
        const error = await catchErr(answersHistoryRepository.sendFile)({
          filename: 'hey.gz',
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.message).to.equal('An error occurred, file is invalid');
      });
    });
  });

  describe('deleteFile', function () {
    describe('when the path does not contain answers/*.parquet', function () {
      describe('when the path does not contain .parquet', function () {
        it('should throw an error', async function () {
          // given
          const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
          sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
          const answersHistoryRepository = AnswersHistoryRepository.createClient();
          providerStub.deleteFile.resolves();
          // when

          const error = await catchErr(answersHistoryRepository.deleteFile)({
            filename: 'answers/folder/delete-me',
          });

          // then
          expect(error).to.be.instanceOf(FileValidationError);
          expect(error.message).to.equal('An error occurred, file is invalid');
        });
      });
    });

    describe('when the path does not contain aswers/', function () {
      it('should throw an error', async function () {
        // given
        const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
        sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
        const answersHistoryRepository = AnswersHistoryRepository.createClient();
        providerStub.deleteFile.resolves();
        // when

        const error = await catchErr(answersHistoryRepository.deleteFile)({
          filename: 'folder/delete-me/please.parquet',
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.message).to.equal('An error occurred, file is invalid');
      });
    });

    describe('when the path is correct but S3 doest not contain the file', function () {
      it('should throw the S3 error', async function () {
        // given
        const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
        sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
        const answersHistoryRepository = AnswersHistoryRepository.createClient();
        const s3Error = new Error('NoSuchKey');
        providerStub.deleteFile.rejects(s3Error);

        // when
        const error = await catchErr(
          answersHistoryRepository.deleteFile,
          answersHistoryRepository,
        )({
          filename: 'answers/folder/delete-me.parquet',
        });

        // then
        expect(error).to.equal(s3Error);
      });
    });
  });

  describe('when the path contains answers/**.parquet', function () {
    it('should delete a file', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const answersHistoryRepository = AnswersHistoryRepository.createClient();
      providerStub.deleteFile.resolves();

      // when
      await answersHistoryRepository.deleteFile({
        filename: 'answers/folder/delete-me.parquet',
      });

      // then
      expect(providerStub.deleteFile).to.have.been.calledWith({ key: 'answers/folder/delete-me.parquet' });
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
