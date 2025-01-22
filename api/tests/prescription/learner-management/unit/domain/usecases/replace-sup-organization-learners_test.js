import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { replaceSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/replace-sup-organization-learners.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, expect, sinon, toStream } from '../../../../../test-helper.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ReplaceSupOrganizationLearner', function () {
  let organizationImportId;
  const organizationId = 1234;
  const userId = 333;
  let organizationImport,
    importStorageStub,
    supOrganizationLearnerRepositoryStub,
    organizationImportRepositoryStub,
    expectedLearners;

  beforeEach(function () {
    organizationImportId = Symbol('organizationImportId');
    organizationImport = new OrganizationImportStatus({
      id: organizationImportId,
      filename: 'file.csv',
      organizationId,
      createdBy: userId,
      encoding: 'utf-8',
    });
    supOrganizationLearnerRepositoryStub = { replaceStudents: sinon.stub().resolves() };
    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);
    importStorageStub = {
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
    expectedLearners = [
      {
        firstName: 'Beatrix',
        middleName: 'The',
        thirdName: 'Bride',
        lastName: 'Kiddo',
        preferredLastName: 'Black Mamba',
        studentNumber: '12346',
        email: 'thebride@example.net',
        birthdate: '1970-01-01',
        diploma: 'Non reconnu',
        department: 'Assassination Squad',
        educationalTeam: 'Hattori Hanzo',
        group: 'Deadly Viper Assassination Squad',
        studyScheme: 'Non reconnu',
        organizationId,
      },
      {
        firstName: 'O-Ren',
        middleName: undefined,
        thirdName: undefined,
        lastName: 'Ishii',
        preferredLastName: 'Cottonmouth',
        studentNumber: '789',
        email: 'ishii@example.net',
        birthdate: '1980-01-01',
        diploma: 'Non reconnu',
        department: 'Assassination Squad',
        educationalTeam: 'Bill',
        group: 'Deadly Viper Assassination Squad',
        studyScheme: 'Non reconnu',
        organizationId,
      },
    ];
  });

  describe('when there is no errors', function () {
    it('replace learners from csv file', async function () {
      // given
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(input));

      // when
      await replaceSupOrganizationLearners({
        organizationImportId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(supOrganizationLearnerRepositoryStub.replaceStudents).to.have.been.calledWithExactly(
        organizationId,
        expectedLearners,
        userId,
      );
    });

    it('should delete file on s3', async function () {
      // given
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(input));

      // when
      await replaceSupOrganizationLearners({
        organizationImportId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: organizationImport.filename });
    });
  });

  context('save import state in database', function () {
    describe('success case', function () {
      it('should save  imported state each after each', async function () {
        // given
        const csvContent = `${supOrganizationLearnerImportHeader}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

        importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));

        // when
        await replaceSupOrganizationLearners({
          organizationImportId,
          supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          i18n,
        });

        // then
        expect(organizationImportRepositoryStub.save).to.have.been.calledOnceWithExactly(organizationImport);
        expect(organizationImport.status).to.equal('IMPORTED');
      });
    });

    describe('errors case', function () {
      beforeEach(function () {
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

        const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
        importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));
      });

      it('should save IMPORT_ERROR status with errors', async function () {
        // given

        const insertError = new Error('insert fail');
        supOrganizationLearnerRepositoryStub.replaceStudents.rejects(insertError);

        // when
        await catchErr(replaceSupOrganizationLearners)({
          organizationImportId,
          i18n,
          supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
        });

        // then
        expect(organizationImportRepositoryStub.save).to.have.been.calledOnceWithExactly(organizationImport);
        expect(organizationImport.status).to.equal('IMPORT_ERROR');
        expect(organizationImport.errors).to.deep.equals([insertError]);
      });
    });
  });
});
