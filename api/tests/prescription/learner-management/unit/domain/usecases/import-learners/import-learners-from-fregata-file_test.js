import sinon from 'sinon';

import { OrganizationImportStatus } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { importLearnersFromFregataFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/import-learners/import-learners-from-fregata-file.js';
import { FregataParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/fregata-parser.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | importLearnersFromFregataFile', function () {
  let organizationId,
    organizationImportId,
    learners,
    i18n,
    s3Filename,
    encoding,
    organizationImport,
    organizationImportRepositoryStub,
    organizationLearnerRepositoryStub,
    studentRepositoryStub,
    importStorageStub,
    parserStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    organizationImportId = Symbol('organizationImportId');
    i18n = Symbol('i18n');
    s3Filename = Symbol('s3FileName');
    encoding = Symbol('encoding');
    organizationImport = new OrganizationImportStatus({
      id: organizationImportId,
      filename: s3Filename,
      organizationId,
      createdBy: 2,
      encoding,
    });

    organizationLearnerRepositoryStub = {
      disableAllOrganizationLearnersInOrganization: sinon.stub(),
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub().resolves(),
      findByOrganizationId: sinon.stub().resolves([]),
    };

    studentRepositoryStub = {
      findReconciledStudentsByNationalStudentId: sinon.stub().resolves([]),
    };

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    importStorageStub = {
      deleteFile: sinon.stub(),
      getParser: sinon.stub(),
    };

    parserStub = {
      parse: sinon.stub(),
    };

    FregataParser.buildParser = sinon.stub();

    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    learners = [{ nationalStudentId: 1 }, { nationalStudentId: 2 }, { nationalStudentId: 3 }];

    organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);
    importStorageStub.getParser
      .withArgs({ Parser: FregataParser, filename: s3Filename }, organizationId, i18n)
      .resolves(parserStub);

    parserStub.parse.withArgs(encoding).returns({ learners });
  });

  context('when there is no errors', function () {
    it('add learners from csv fivle', async function () {
      await importLearnersFromFregataFile({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        studentRepository: studentRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      expect(
        organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization.calledWithExactly({
          organizationId,
          nationalStudentIds: [1, 2, 3],
        }),
        'organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization',
      ).to.be.true;

      expect(
        organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.calledOnce,
        'organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners',
      ).to.be.true;
    });

    it('should chunk the called insertion', async function () {
      await importLearnersFromFregataFile({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        studentRepository: studentRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        chunkLength: 2,
      });

      expect(
        organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.calledTwice,
        'organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners',
      ).to.be.true;
    });

    it('should delete file on s3', async function () {
      await importLearnersFromFregataFile({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        studentRepository: studentRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: organizationImport.filename });
    });

    it('should save imported state', async function () {
      // when
      await importLearnersFromFregataFile({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        studentRepository: studentRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.firstCall.firstArg.status).to.equal('IMPORTED');
    });
  });

  describe('When errors occured', function () {
    beforeEach(function () {
      const insertError = new Error('insert fail');
      organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.rejects(insertError);
    });

    it('should save IMPORT_ERROR status with error', async function () {
      // when
      const error = await catchErr(importLearnersFromFregataFile)({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      const firstCallFirstArg = organizationImportRepositoryStub.save.firstCall.firstArg;
      expect(firstCallFirstArg.errors).to.deep.equals([error]);
      expect(firstCallFirstArg.status).to.equal('IMPORT_ERROR');
    });

    it('should not delete file on s3 so the import can be retried', async function () {
      await catchErr(importLearnersFromFregataFile)({
        organizationImportId,
        i18n,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        studentRepository: studentRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      expect(importStorageStub.deleteFile).to.have.been.not.called;
    });
  });
});
