import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { validateSupCsvFile } from '../../../../../../src/prescription/learner-management/domain/usecases/validate-sup-csv-file.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { catchErr, expect, sinon, toStream } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  const organizationId = 1234;
  let organizationImport, organizationImportRepositoryStub, importStorageStub;

  beforeEach(function () {
    organizationImport = new OrganizationImport({
      filename: 'file.csv',
      organizationId,
      createdBy: 2,
      encoding: 'utf-8',
    });

    organizationImportRepositoryStub = {
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    importStorageStub = {
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
  });

  context('when there is no errors', function () {
    it('should save validated state', async function () {
      // given
      organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImport);

      const csvContent = `${supOrganizationLearnerImportHeader}
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
      `.trim();

      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));

      // when
      await validateSupCsvFile({
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save).to.have.been.calledOnceWithExactly(organizationImport);
    });
  });

  context('when there is errors', function () {
    beforeEach(function () {
      organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImport);

      const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));
    });

    it('should save VALIDATION_ERROR status', async function () {
      // given
      const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));

      // when
      await catchErr(validateSupCsvFile)({
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.firstCall.firstArg.status).to.equal('VALIDATION_ERROR');
    });
  });
});
