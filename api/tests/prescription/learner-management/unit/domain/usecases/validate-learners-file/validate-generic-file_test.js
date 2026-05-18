import sinon from 'sinon';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { GenericOrganizationLearnerSet } from '../../../../../../../src/prescription/learner-management/domain/models/GenericOrganizationLearnerSet.js';
import { ImportFromGenericFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromGenericFileJob.js';
import { validateGenericFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/validate-learners-file/validate-generic-file.js';
import { GenericParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/generic-parser.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | validateGenericFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    importFromGenericFileJobRepositoryStub,
    commonCsvLearnerParserStub,
    importOrganizationLearnerSetStub,
    dependencieStub,
    importStorageStub,
    organizationImportStub,
    dataBuffer,
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

    dataBuffer = Symbol('DataBuffer');
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

    dependencieStub = {
      createReadStream: sinon.stub(),
      getDataBuffer: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    sinon.stub(GenericParser, 'buildParser');

    commonCsvLearnerParserStub = {
      parse: sinon.stub(),
    };
    sinon.stub(GenericOrganizationLearnerSet, 'buildSet');
    importOrganizationLearnerSetStub = {
      addLearners: sinon.stub(),
    };

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };

    organizationImportStub = {
      organizationId,
      validate: sinon.stub(),
      filename: s3Filepath,
    };
  });

  context('success cases', function () {
    it('should validate the file', async function () {
      // given
      const parsedLearners = Symbol('parsed learners');

      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);

      importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);

      dependencieStub.getDataBuffer.withArgs(dataStream).resolves(dataBuffer);

      GenericParser.buildParser.withArgs({ buffer: dataBuffer, importFormat }).returns(commonCsvLearnerParserStub);

      commonCsvLearnerParserStub.parse.withArgs(fileEncoding).returns(parsedLearners);

      GenericOrganizationLearnerSet.buildSet
        .withArgs({ organizationId, importFormat })
        .returns(importOrganizationLearnerSetStub);

      importOrganizationLearnerSetStub.addLearners.withArgs(parsedLearners);

      // when
      await validateGenericFile({
        organizationImportId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        importFromGenericFileJobRepository: importFromGenericFileJobRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(organizationImportStub.validate.calledOnceWithExactly({ errors: [] }), 'organizationImport.validate').to.be
        .true;
      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'organizationImportRepository.save',
      ).to.be.true;
      expect(importStorageStub.deleteFile.called, 'importStorage.deleteFile').to.be.false;
    });
  });

  context(' error cases', function () {
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
          dependencies: dependencieStub,
        });

        expect(validateError).to.instanceOf(AggregateImportError);
        expect(
          organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
          'organizationImportRepository.save',
        ).to.be.true;
        expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath }), 'importStorage.deleteFile')
          .to.be.true;
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
            dependencies: dependencieStub,
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
            dependencies: dependencieStub,
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
