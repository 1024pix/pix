import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportOrganizationLearnerSet } from '../../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { saveOrganizationLearnersFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/import-from-feature/save-organization-learners-file.js';
import { CommonCsvLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr, expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | UseCase | saveOrganizationLearnersFile', function () {
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
    organizationId,
    dataStream,
    s3Filepath,
    learnerToSave,
    learnerToUpdate,
    learnerIds,
    importFormat,
    parsedLearners,
    existingLearners;

  beforeEach(function () {
    organizationId = 1234;
    s3Filepath = Symbol('s3-path.csv');
    fileEncoding = Symbol('file encoding');
    dataBuffer = Symbol('DataBuffer');
    dataStream = Symbol('DataStream');
    existingLearners = Symbol('Existing learners');
    learnerToSave = Symbol('learner to save');
    learnerToUpdate = Symbol('learner to update');
    learnerIds = Symbol('learner Ids');

    importFormat = Symbol('importFormat');

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
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    organizationLearnerRepositoryStub = {
      disableCommonOrganizationLearnersFromOrganizationId: sinon.stub(),
      updateCommonLearnersFromOrganizationId: sinon.stub(),
      saveCommonOrganizationLearners: sinon.stub(),
      findAllCommonLearnersFromOrganizationId: sinon.stub(),
    };

    sinon.stub(CommonCsvLearnerParser, 'buildParser');

    commonCsvLearnerParserStub = {
      parse: sinon.stub(),
    };

    sinon.stub(ImportOrganizationLearnerSet, 'buildSet');
    importOrganizationLearnerSetStub = {
      addLearners: sinon.stub(),
      setExistingLearners: sinon.stub(),
      learners: {
        create: learnerToSave,
        update: learnerToUpdate,
        existinglearnerIds: learnerIds,
      },
    };

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };

    // get latest organizationImport
    organizationImportStub = {
      process: sinon.stub(),
      filename: s3Filepath,
    };
    organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImportStub);

    // get config from feature import
    organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);

    // read s3 && bufferize
    importStorageStub.readFile.withArgs({ filename: s3Filepath }).resolves(dataStream);
    dependencieStub.getDataBuffer.withArgs(dataStream).resolves(dataBuffer);

    // parse the buffer
    CommonCsvLearnerParser.buildParser
      .withArgs({ buffer: dataBuffer, importFormat })
      .returns(commonCsvLearnerParserStub);
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

  context('success cases', function () {
    it('should process the file', async function () {
      // when
      await saveOrganizationLearnersFile({
        organizationId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(
        organizationLearnerRepositoryStub.findAllCommonLearnersFromOrganizationId.calledOnceWithExactly({
          organizationId,
        }),
        'organizationLearnerRepository.findAllCommonLearnersFromOrganizationId',
      ).to.be.true;
      expect(importOrganizationLearnerSetStub.setExistingLearners.calledOnceWithExactly(existingLearners)).to.be.true;
      expect(
        organizationLearnerRepositoryStub.disableCommonOrganizationLearnersFromOrganizationId.calledOnceWithExactly({
          organizationId,
          excludeOrganizationLearnerIds: learnerIds,
        }),
        'organizationLearnerRepository.disableCommonOrganizationLearnersFromOrganizationId',
      ).to.be.true;
      expect(
        organizationLearnerRepositoryStub.updateCommonLearnersFromOrganizationId.calledOnceWithExactly({
          organizationId,
          learners: learnerToUpdate,
        }),
        'organizationLearnerRepository.updateCommonLearnersFromOrganizationId',
      ).to.be.true;
      expect(
        organizationLearnerRepositoryStub.saveCommonOrganizationLearners.calledOnceWithExactly(learnerToSave),
        'organizationLearnerRepository.saveCommonOrganizationLearners',
      ).to.be.true;

      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'orgnizationImportRepository.save',
      ).to.be.true;
      expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath }), 'importStorage.deleteFile')
        .to.be.true;
    });
  });

  context(' error cases', function () {
    it('save the error when an error occured', async function () {
      // given
      const error = new Error('Ooops');
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

      // when
      const saveError = await catchErr(saveOrganizationLearnersFile)({
        organizationId,
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
      expect(importStorageStub.deleteFile.calledOnceWithExactly({ filename: s3Filepath }), 'importStorage.deleteFile')
        .to.be.true;
    });

    context('error list', function () {
      it('should save the error', async function () {
        // given
        const error = new Error('Error Happened');
        organizationImportRepositoryStub.getLastByOrganizationId
          .withArgs(organizationId)
          .resolves(organizationImportStub);

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

        // when
        await catchErr(saveOrganizationLearnersFile)({
          organizationId,
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
        organizationImportRepositoryStub.getLastByOrganizationId
          .withArgs(organizationId)
          .resolves(organizationImportStub);

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects([error, error]);

        // when
        await catchErr(saveOrganizationLearnersFile)({
          organizationId,
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
