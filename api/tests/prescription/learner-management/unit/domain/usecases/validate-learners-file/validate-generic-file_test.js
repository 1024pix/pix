import { expect } from 'chai';
import sinon from 'sinon';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportOrganizationLearnerSet } from '../../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { ImportFromGenericFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromGenericFileJob.js';
import { validateGenericFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/validate-learners-file/validate-generic-file.js';
import { GenericParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/generic-parser.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

async function* asyncLines(...lines) {
  yield* lines;
}

describe('Unit | UseCase | validateGenericFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    importFromGenericFileJobRepositoryStub,
    commonCsvLearnerParserStub,
    importOrganizationLearnerSetStub,
    importStorageStub,
    organizationImportStub,
    fileEncoding,
    organizationId,
    organizationImportId,
    dataStream,
    importFormat,
    s3Filepath;

  beforeEach(function () {
    organizationId = 1234;

    s3Filepath = Symbol('s3-path.csv');

    fileEncoding = Symbol('file encoding');

    dataStream = Symbol('DataStream');

    importFormat = Symbol('importFormat');
    organizationImportId = Symbol('organizationImportId');

    importStorageStub = {
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    importFromGenericFileJobRepositoryStub = { performAsync: sinon.stub() };

    importFromGenericFileJobRepositoryStub.performAsync
      .withArgs(new ImportFromGenericFileJob({ organizationImportId }))
      .resolves();

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    sinon.stub(GenericParser, 'buildParser');

    commonCsvLearnerParserStub = {
      parseStream: sinon.stub(),
    };
    sinon.stub(ImportOrganizationLearnerSet, 'buildSet');
    importOrganizationLearnerSetStub = {
      addLearner: sinon.stub(),
      throwIfErrors: sinon.stub(),
    };

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };

    organizationImportStub = {
      organizationId,
      validate: sinon.stub(),
      filename: s3Filepath,
      encoding: fileEncoding,
    };
  });

  context('success cases', function () {
    it('should add each parsed line to the learner set, one by one', async function () {
      // given
      const firstLine = Symbol('first line');
      const secondLine = Symbol('second line');

      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);
      importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
      GenericParser.buildParser.withArgs({ importFormat }).returns(commonCsvLearnerParserStub);
      ImportOrganizationLearnerSet.buildSet
        .withArgs({ organizationId, importFormat })
        .returns(importOrganizationLearnerSetStub);
      commonCsvLearnerParserStub.parseStream
        .withArgs({ readableStream: dataStream, encoding: fileEncoding })
        .returns(asyncLines(firstLine, secondLine));

      // when
      await validateGenericFile({
        organizationImportId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
      });

      // then
      expect(importOrganizationLearnerSetStub.addLearner.firstCall.calledWithExactly(firstLine)).to.be.true;
      expect(importOrganizationLearnerSetStub.addLearner.secondCall.calledWithExactly(secondLine)).to.be.true;
      expect(importOrganizationLearnerSetStub.throwIfErrors).to.have.been.calledAfter(
        importOrganizationLearnerSetStub.addLearner,
      );
    });

    it('should validate the file', async function () {
      // given
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);
      importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
      GenericParser.buildParser.withArgs({ importFormat }).returns(commonCsvLearnerParserStub);
      ImportOrganizationLearnerSet.buildSet
        .withArgs({ organizationId, importFormat })
        .returns(importOrganizationLearnerSetStub);
      commonCsvLearnerParserStub.parseStream.returns(asyncLines());

      // when
      await validateGenericFile({
        organizationImportId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
      });

      // then
      expect(organizationImportStub.validate.calledOnceWithExactly({ errors: [] }), 'organizationImport.validate').to.be
        .true;
      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'organizationImportRepository.save',
      ).to.be.true;
      expect(importStorageStub.deleteFile.called, 'importStorage.deleteFile').to.be.false;
      expect(importFromGenericFileJobRepositoryStub.performAsync.firstCall).calledAfter(
        organizationImportRepositoryStub.save.firstCall,
      );
    });
  });

  context('error cases', function () {
    context('when there is an error occured', function () {
      it('should throw and delete file on storage', async function () {
        // given
        const error = new Error('Error Happened');
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

        // when
        const validateError = await catchErr(validateGenericFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
        });

        expect(validateError).to.instanceOf(AggregateImportError);
        expect(
          organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
          'organizationImportRepository.save',
        ).to.be.true;
        expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath }), 'importStorage.deleteFile')
          .to.be.true;
      });

      it('should save the file errors thrown by the parser and delete file on storage', async function () {
        // given
        const fileErrors = [new Error('BAD_CSV_FORMAT')];
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);
        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);
        importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
        GenericParser.buildParser.withArgs({ importFormat }).returns(commonCsvLearnerParserStub);
        ImportOrganizationLearnerSet.buildSet
          .withArgs({ organizationId, importFormat })
          .returns(importOrganizationLearnerSetStub);
        commonCsvLearnerParserStub.parseStream.returns(
          (async function* () {
            yield Symbol('line');
            throw fileErrors;
          })(),
        );

        // when
        const validateError = await catchErr(validateGenericFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
        });

        // then
        expect(validateError).to.instanceOf(AggregateImportError);
        expect(organizationImportStub.validate.calledOnceWithExactly({ errors: fileErrors })).to.be.true;
        expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath })).to.be.true;
        expect(importOrganizationLearnerSetStub.throwIfErrors).to.not.have.been.called;
      });

      it('should save the lines validation errors and delete file on storage', async function () {
        // given
        const lineErrors = [new Error('line 2'), new Error('line 3')];
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);
        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);
        importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
        GenericParser.buildParser.withArgs({ importFormat }).returns(commonCsvLearnerParserStub);
        ImportOrganizationLearnerSet.buildSet
          .withArgs({ organizationId, importFormat })
          .returns(importOrganizationLearnerSetStub);
        commonCsvLearnerParserStub.parseStream.returns(asyncLines());
        importOrganizationLearnerSetStub.throwIfErrors.throws(lineErrors);

        // when
        const validateError = await catchErr(validateGenericFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
        });

        // then
        expect(validateError).to.instanceOf(AggregateImportError);
        expect(organizationImportStub.validate.calledOnceWithExactly({ errors: lineErrors })).to.be.true;
        expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath })).to.be.true;
      });

      context('error list', function () {
        it('should save the error', async function () {
          // given
          const error = new Error('Error Happened');
          organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

          organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

          // when
          await catchErr(validateGenericFile)({
            organizationImportId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
          });

          expect(
            organizationImportStub.validate.calledOnceWithExactly({ errors: [error] }),
            'organizationImport.validate',
          ).to.be.true;
        });

        it('should save the errors', async function () {
          // given
          const error = new Error('Error Happened');
          organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

          organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects([error, error]);

          // when
          await catchErr(validateGenericFile)({
            organizationImportId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
          });

          expect(
            organizationImportStub.validate.calledOnceWithExactly({ errors: [error, error] }),
            'organizationImport.validate',
          ).to.be.true;
        });
      });
    });
  });
});
