import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { importSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/import-sup-organization-learners.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { catchErr, expect, sinon, toStream } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  const organizationId = 1234;
  let organizationImport, organizationImportRepositoryStub, supOrganizationLearnerRepositoryStub, importStorageStub;

  beforeEach(function () {
    organizationImport = new OrganizationImport({
      filename: 'file.csv',
      organizationId,
      createdBy: 2,
      encoding: 'utf-8',
    });

    supOrganizationLearnerRepositoryStub = { addStudents: sinon.stub().resolves() };

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
    it('add students from csv fivle', async function () {
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();
      organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImport);
      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(input));

      await importSupOrganizationLearners({
        organizationId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      expect(supOrganizationLearnerRepositoryStub.addStudents).to.have.been.calledWithExactly([
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
      ]);
    });

    it('should return warnings about the import', async function () {
      const input = `${supOrganizationLearnerImportHeader}
              Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
      organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImport);
      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(input));

      const warnings = await importSupOrganizationLearners({
        organizationId,
        i18n,
        importStorage: importStorageStub,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
      });

      expect(warnings).to.deep.equal([
        { studentNumber: '123456', field: 'study-scheme', value: 'BAD', code: 'unknown' },
        { studentNumber: '123456', field: 'diploma', value: 'BAD', code: 'unknown' },
      ]);
    });

    it('should delete file on s3', async function () {
      const input = `${supOrganizationLearnerImportHeader}
              Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;
          `.trim();
      organizationImportRepositoryStub.getLastByOrganizationId.withArgs(organizationId).resolves(organizationImport);
      importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(input));

      await importSupOrganizationLearners({
        organizationId,
        i18n,
        importStorage: importStorageStub,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
      });

      expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: organizationImport.filename });
    });
  });

  context('save import state in database', function () {
    describe('success case', function () {
      it('should save uploaded, validated and imported state each after each', async function () {
        // given
        organizationImportRepositoryStub.getLastByOrganizationId
          .withArgs(organizationId)
          // we create a new instance for each call so save spies will store different
          // args object
          .callsFake(() => new OrganizationImport({ ...organizationImport }));

        const csvContent = `${supOrganizationLearnerImportHeader}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

        importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));

        // when
        await importSupOrganizationLearners({
          organizationId,
          i18n,
          supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
        });

        // then
        const firstCallArg = organizationImportRepositoryStub.save.firstCall.firstArg;
        const secondCallArg = organizationImportRepositoryStub.save.secondCall.firstArg;

        expect(firstCallArg.status).to.equal('VALIDATED');
        expect(secondCallArg.status).to.equal('IMPORTED');
      });
    });

    describe('errors case', function () {
      beforeEach(function () {
        organizationImportRepositoryStub.getLastByOrganizationId
          .withArgs(organizationId)
          // we create a new instance for each call so save spies will store different
          // args object
          .callsFake(() => new OrganizationImport({ ...organizationImport }));

        const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
        importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));
      });

      describe('when there is an validation error', function () {
        it('should save VALIDATION_ERROR status', async function () {
          // given
          const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
          importStorageStub.readFile.withArgs({ filename: organizationImport.filename }).resolves(toStream(csvContent));

          // when
          await catchErr(importSupOrganizationLearners)({
            organizationId,
            i18n,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            organizationImportRepository: organizationImportRepositoryStub,
            importStorage: importStorageStub,
          });

          // then
          expect(organizationImportRepositoryStub.save.firstCall.firstArg.status).to.equal('VALIDATION_ERROR');
        });
      });

      describe('when there is an import error', function () {
        it('should save IMPORT_ERROR status', async function () {
          // given
          supOrganizationLearnerRepositoryStub.addStudents.rejects('errors');

          // when
          await catchErr(importSupOrganizationLearners)({
            organizationId,
            i18n,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            organizationImportRepository: organizationImportRepositoryStub,
            importStorage: importStorageStub,
          });

          // then
          expect(organizationImportRepositoryStub.save.secondCall.args[0].status).to.equal('IMPORT_ERROR');
        });
      });
    });
  });
});
