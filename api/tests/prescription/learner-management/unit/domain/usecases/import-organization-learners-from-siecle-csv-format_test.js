import iconv from 'iconv-lite';
import { Readable } from 'stream';

import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { importOrganizationLearnersFromSIECLECSVFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-csv-format.js';
import { OrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/organization-learner-import-header.js';
import { expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | UseCase | import-organization-learners-from-siecle-csv', function () {
  const organizationId = 1234;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let importStorageStub;
  let payload;
  let filename;
  let domainTransaction;
  let i18n;
  let csvHeaders;

  beforeEach(function () {
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });
    payload = { path: 'file' };
    filename = Symbol('file.csv');

    i18n = getI18n();
    csvHeaders = new OrganizationLearnerImportHeader(i18n).columns.map((column) => column.name).join(';');

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      addOrUpdateOrganizationAgriOrganizationLearners: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };

    organizationRepositoryStub = { get: sinon.stub() };
  });

  context('when extracted organizationLearners informations can be imported', function () {
    beforeEach(function () {
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
      organizationRepositoryStub.get.withArgs(organizationId).resolves({ id: 123 });

      const input = `${csvHeaders}
      4581234567F;Léa;Jeannette;Klervi;Corse;Cottonmouth;Féminin;01/01/1990;2A214;;2A;99100;AP;MEF1;Division 2
      4581234567G;Léo;;;Corse;;Féminin;01/01/1990;;Plymouth;99;99132;ST;MEF1;Division 1
      `.trim();

      importStorageStub.readFile.withArgs({ filename }).resolves(
        new Readable({
          read() {
            this.push(iconv.encode(input, 'utf8'));
            this.push(null);
          },
        }),
      );
    });

    it('should save these informations', async function () {
      await importOrganizationLearnersFromSIECLECSVFormat({
        organizationId,
        payload,
        organizationRepository: organizationRepositoryStub,
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
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        importStorage: importStorageStub,
        i18n,
      });
      expect(importStorageStub.deleteFile).to.have.been.called;
    });
  });
});
