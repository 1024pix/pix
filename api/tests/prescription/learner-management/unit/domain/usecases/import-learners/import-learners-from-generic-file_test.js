import sinon from 'sinon';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportOrganizationLearnerSet } from '../../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { importLearnersFromGenericFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/import-learners/import-learners-from-generic-file.js';
import { GenericParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/generic-parser.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | importLearnersFromGenericFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    commonCsvLearnerParserStub,
    importOrganizationLearnerSetStub,
    organizationLearnerRepositoryStub,
    dependencieStub,
    importStorageStub,
    organizationImportStub,
    dataBuffer,
    fileEncoding,
    organizationImportId,
    organizationId,
    dataStream,
    s3Filepath,
    learnerToSave,
    learnerIds,
    importFormat,
    parsedLearners,
    existingLearners;

  beforeEach(function () {
    organizationImportId = Symbol('organizationImportId');
    organizationId = 1234;
    s3Filepath = Symbol('s3-path.csv');
    fileEncoding = Symbol('file encoding');
    dataBuffer = Symbol('DataBuffer');
    dataStream = Symbol('DataStream');
    existingLearners = Symbol('Existing learners');
    learnerToSave = Symbol('learner to save');
    learnerIds = Symbol('learner Ids');

    importFormat = Symbol('OrganizationLearnerImportFormat');

    parsedLearners = Symbol('parsed learners');

    importStorageStub = {
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    dependencieStub = {
      createReadStream: sinon.stub(),
      getDataBuffer: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    organizationLearnerRepositoryStub = {
      disableCommonOrganizationLearnersFromOrganizationId: sinon.stub(),
      saveCommonOrganizationLearners: sinon.stub(),
      findAllCommonLearnersFromOrganizationId: sinon.stub(),
    };

    sinon.stub(GenericParser, 'buildParser');

    commonCsvLearnerParserStub = {
      parse: sinon.stub(),
    };

    sinon.stub(ImportOrganizationLearnerSet, 'buildSet');
    importOrganizationLearnerSetStub = {
      addLearners: sinon.stub(),
      setExistingLearners: sinon.stub(),
      learners: {
        list: learnerToSave,
        existinglearnerIds: learnerIds,
      },
    };

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };

    // get latest organizationImport
    organizationImportStub = {
      organizationId,
      process: sinon.stub(),
      filename: s3Filepath,
    };
    organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

    // get config from feature import
    organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);

    // read s3 && bufferize
    importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
    dependencieStub.getDataBuffer.withArgs(dataStream).resolves(dataBuffer);

    // parse the buffer
    GenericParser.buildParser.withArgs({ buffer: dataBuffer, importFormat }).returns(commonCsvLearnerParserStub);
    commonCsvLearnerParserStub.parse.withArgs(fileEncoding).returns(parsedLearners);

    organizationLearnerRepositoryStub.findAllCommonLearnersFromOrganizationId
      .withArgs({ organizationId })
      .resolves(existingLearners);

    // instantiate learners to save
    ImportOrganizationLearnerSet.buildSet
      .withArgs({ organizationId, importFormat })
      .returns(importOrganizationLearnerSetStub);
    importOrganizationLearnerSetStub.addLearners.withArgs(parsedLearners);
  });

  context(' error cases', function () {
    it('save the error when an error occured', async function () {
      // given
      const error = new Error('Ooops');
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

      // when
      const saveError = await catchErr(importLearnersFromGenericFile)({
        organizationImportId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(saveError).to.instanceOf(AggregateImportError);
      expect(
        organizationLearnerRepositoryStub.disableCommonOrganizationLearnersFromOrganizationId.called,
        'organizationLearnerRepository.disableCommonOrganizationLearnersFromOrganizationId',
      ).to.be.false;
      expect(
        organizationLearnerRepositoryStub.saveCommonOrganizationLearners.called,
        'organizationLearnerRepository.saveCommonOrganizationLearners',
      ).to.be.false;
      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'orgnizationImportRepository.save',
      ).to.be.true;
      expect(importStorageStub.deleteFile.called, 'importStorage.deleteFile').to.be.false;
    });

    context('error list', function () {
      it('should save the error', async function () {
        // given
        const error = new Error('Error Happened');
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

        // when
        await catchErr(importLearnersFromGenericFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          dependencies: dependencieStub,
        });

        expect(organizationImportStub.process.calledOnceWithExactly({ errors: [error] }), 'organizationImport.process')
          .to.be.true;
      });

      it('should save the errors', async function () {
        // given
        const error = new Error('Error Happened');
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects([error, error]);

        // when
        await catchErr(importLearnersFromGenericFile)({
          organizationImportId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          dependencies: dependencieStub,
        });

        expect(
          organizationImportStub.process.calledOnceWithExactly({ errors: [error, error] }),
          'organizationImport.process',
        ).to.be.true;
      });
    });
  });
});
