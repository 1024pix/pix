import { expect, sinon } from '../../../../../test-helper.js';
import { importOrganizationLearnersFromSIECLECSVFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-csv-format.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationLearner } from '../../../../../../lib/domain/models/OrganizationLearner.js';

import fs from 'fs/promises';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

describe('Unit | UseCase | import-organization-learners-from-siecle-csv', function () {
  const organizationId = 1234;
  let organizationLearnersCsvServiceStub;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let importStorageStub;
  let payload = { path: 'file.csv' };
  let domainTransaction;

  beforeEach(function () {
    sinon.stub(fs, 'rm');
    sinon.stub(fs, 'readFile');
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });
    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    organizationLearnersCsvServiceStub = { extractOrganizationLearnersInformation: sinon.stub() };
    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      addOrUpdateOrganizationAgriOrganizationLearners: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };

    organizationRepositoryStub = { get: sinon.stub() };
  });

  context('when extracted organizationLearners informations can be imported', function () {
    payload = { path: 'file.csv' };

    beforeEach(function () {
      const readableStream = Symbol('readableStream');
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves('file.csv');
      importStorageStub.readFile.withArgs(payload.path).resolves(readableStream);
      const organization = Symbol('organization');
      organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);

      const organizationLearner1 = new OrganizationLearner({
        id: undefined,
        nationalStudentId: '123F',
        firstName: 'Beatrix',
        middleName: 'The',
        thirdName: 'Bride',
        lastName: 'Kiddo',
        preferredLastName: 'Black Mamba',
        birthdate: '1970-01-01',
        birthCityCode: '97422',
        birthProvinceCode: '974',
        birthCountryCode: '100',
        status: 'ST',
        MEFCode: 'MEF1',
        division: 'Division 1',
        organizationId,
      });
      const organizationLearner2 = new OrganizationLearner({
        id: undefined,
        nationalStudentId: '456F',
        firstName: 'O-Ren',
        lastName: 'Ishii',
        preferredLastName: 'Cottonmouth',
        birthdate: '1980-01-01',
        birthCity: 'Shangai',
        birthProvinceCode: '99',
        birthCountryCode: '132',
        status: 'ST',
        MEFCode: 'MEF1',
        division: 'Division 2',
        organizationId,
      });
      organizationLearnersCsvServiceStub.extractOrganizationLearnersInformation.returns([
        organizationLearner1,
        organizationLearner2,
      ]);
    });

    it('should save these informations', async function () {
      await importOrganizationLearnersFromSIECLECSVFormat({
        organizationId,
        payload,
        organizationRepository: organizationRepositoryStub,
        organizationLearnersCsvService: organizationLearnersCsvServiceStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        importStorage: importStorageStub,
        i18n,
      });

      expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.called;
    });

    it('should delete file on s3', async function () {
      await importOrganizationLearnersFromSIECLECSVFormat({
        organizationId,
        payload,
        organizationRepository: organizationRepositoryStub,
        organizationLearnersCsvService: organizationLearnersCsvServiceStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        importStorage: importStorageStub,
        i18n,
      });
      expect(importStorageStub.deleteFile).to.have.been.called;
    });
  });
});
