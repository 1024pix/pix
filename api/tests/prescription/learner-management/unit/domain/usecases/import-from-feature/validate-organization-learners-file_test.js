import sinon from 'sinon';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportCommonOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/domain/models/ImportCommonOrganizationLearnersJob.js';
import { ImportOrganizationLearnerSet } from '../../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { validateOrganizationLearnersFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/import-from-feature/validate-organization-learners-file.js';
import { CommonCsvLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | validateOrganizationLearnersFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    importCommonOrganizationLearnersJobRepositoryStub,
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

    importCommonOrganizationLearnersJobRepositoryStub = { performAsync: sinon.stub() };

    importCommonOrganizationLearnersJobRepositoryStub.performAsync
      .withArgs(new ImportCommonOrganizationLearnersJob({ organizationImportId }))
      .resolves();

    dependencieStub = {
      createReadStream: sinon.stub(),
      getDataBuffer: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    sinon.stub(CommonCsvLearnerParser, 'buildParser');

    commonCsvLearnerParserStub = {
      parse: sinon.stub(),
    };
    sinon.stub(ImportOrganizationLearnerSet, 'buildSet');
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

      CommonCsvLearnerParser.buildParser
        .withArgs({ buffer: dataBuffer, importFormat })
        .returns(commonCsvLearnerParserStub);

      commonCsvLearnerParserStub.parse.withArgs(fileEncoding).returns(parsedLearners);

      ImportOrganizationLearnerSet.buildSet
        .withArgs({ organizationId, importFormat })
        .returns(importOrganizationLearnerSetStub);

      importOrganizationLearnerSetStub.addLearners.withArgs(parsedLearners);

      // when
      await validateOrganizationLearnersFile({
        organizationImportId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        importCommonOrganizationLearnersJobRepository: importCommonOrganizationLearnersJobRepositoryStub,
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
        const validateError = await catchErr(validateOrganizationLearnersFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          importCommonOrganizationLearnersJobRepository: importCommonOrganizationLearnersJobRepositoryStub,
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
          await catchErr(validateOrganizationLearnersFile)({
            organizationImportId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            importCommonOrganizationLearnersJobRepository: importCommonOrganizationLearnersJobRepositoryStub,
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
          await catchErr(validateOrganizationLearnersFile)({
            organizationImportId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            importCommonOrganizationLearnersJobRepository: importCommonOrganizationLearnersJobRepositoryStub,
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
