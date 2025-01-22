import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { AggregateImportError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportScoCsvOrganizationLearnersJob } from '../../../../../../src/prescription/learner-management/domain/models/ImportScoCsvOrganizationLearnersJob.js';
import { ImportSupOrganizationLearnersJob } from '../../../../../../src/prescription/learner-management/domain/models/ImportSupOrganizationLearnersJob.js';
import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { validateCsvFile } from '../../../../../../src/prescription/learner-management/domain/usecases/validate-csv-file.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | validateCsvFile', function () {
  let organizationImportId, organizationId;
  let csvContent,
    expectedWarnings,
    organizationImport,
    organizationImportRepositoryStub,
    importStorageStub,
    importSupOrganizationLearnersJobRepositoryStub,
    importScoCsvOrganizationLearnersJobRepositoryStub;

  beforeEach(function () {
    organizationImportId = Symbol('organizationImportId');
    organizationId = 1234;
    csvContent = `${supOrganizationLearnerImportHeader}
    Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
    `.trim();

    expectedWarnings = [
      {
        studentNumber: '123456',
        field: 'study-scheme',
        value: 'BAD',
        code: 'unknown',
      },
      {
        studentNumber: '123456',
        field: 'diploma',
        value: 'BAD',
        code: 'unknown',
      },
    ];
    organizationImport = new OrganizationImportStatus({
      id: organizationImportId,
      filename: 'file.csv',
      organizationId,
      createdBy: 2,
      encoding: 'utf-8',
    });

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub(),
    };

    importStorageStub = {
      getParser: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    importSupOrganizationLearnersJobRepositoryStub = {
      performAsync: sinon.stub(),
    };

    importScoCsvOrganizationLearnersJobRepositoryStub = {
      performAsync: sinon.stub(),
    };
  });

  context('when there is no errors', function () {
    it('should save validated state', async function () {
      // given
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: organizationImport.filename }, organizationId, i18n)
        .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

      // when
      await validateCsvFile({
        Parser: SupOrganizationLearnerParser,
        organizationImportId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save).to.have.been.calledOnceWithExactly(organizationImport);
      expect(organizationImport.status).to.equal(IMPORT_STATUSES.VALIDATED);
      expect(organizationImport.errors).to.deep.equal(expectedWarnings);
    });

    describe('performJob', function () {
      it('should perform sup job when type other than FREGATA is detected', async function () {
        // given
        const type = Symbol('type');
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

        importStorageStub.getParser
          .withArgs(
            { Parser: SupOrganizationLearnerParser, filename: organizationImport.filename },
            organizationId,
            i18n,
          )
          .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

        // when
        await validateCsvFile({
          Parser: SupOrganizationLearnerParser,
          type,
          organizationImportId,
          importSupOrganizationLearnersJobRepository: importSupOrganizationLearnersJobRepositoryStub,
          i18n,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
        });

        // then
        expect(importSupOrganizationLearnersJobRepositoryStub.performAsync).to.have.been.calledOnceWithExactly(
          new ImportSupOrganizationLearnersJob({
            type,
            locale: 'fr',
            organizationImportId,
          }),
        );
      });

      it('should perform sco csv job when type is detected', async function () {
        // given
        const type = 'FREGATA';
        organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

        importStorageStub.getParser
          .withArgs(
            { Parser: SupOrganizationLearnerParser, filename: organizationImport.filename },
            organizationId,
            i18n,
          )
          .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

        // when
        await validateCsvFile({
          Parser: SupOrganizationLearnerParser,
          type,
          organizationImportId,
          importScoCsvOrganizationLearnersJobRepository: importScoCsvOrganizationLearnersJobRepositoryStub,
          i18n,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
        });

        // then
        expect(importScoCsvOrganizationLearnersJobRepositoryStub.performAsync).to.have.been.calledOnceWithExactly(
          new ImportScoCsvOrganizationLearnersJob({
            locale: 'fr',
            organizationImportId,
          }),
        );
      });
    });
  });

  context('when there is errors', function () {
    let importSupOrganizationLearnersJobRepositoryStub, organizationImportStub;
    beforeEach(function () {
      importSupOrganizationLearnersJobRepositoryStub = {
        performAsync: sinon.stub(),
      };

      organizationImportStub = {
        id: 1,
        filename: Symbol('filename'),
        encoding: Symbol('encoding'),
        validate: sinon.stub(),
        save: sinon.stub(),
      };
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImportStub);
    });

    context('when there is s3 errors', function () {
      it('should save error when there is an error reading file from S3', async function () {
        const s3Error = new Error('s3 error');
        importStorageStub.getParser.rejects(s3Error);
        const error = await catchErr(validateCsvFile)({
          organizationImportId,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
          importSupOrganizationLearnersJobRepository: importSupOrganizationLearnersJobRepositoryStub,
        });
        expect(error).to.eq(s3Error);
        expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({
          filename: organizationImportStub.filename,
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
        expect(organizationImportStub.validate).to.have.been.calledWithExactly({
          errors: [s3Error],
          warnings: undefined,
        });
      });

      it('should save error when there is an error deleting file from S3', async function () {
        const parserStub = { parse: sinon.stub() };
        importStorageStub.getParser
          .withArgs(
            { Parser: SupOrganizationLearnerParser, filename: organizationImport.filename },
            organizationId,
            i18n,
          )
          .resolves(parserStub);
        parserStub.parse.rejects(new AggregateImportError([new Error('parsing')]));
        const s3Error = new Error('s3 error');
        importStorageStub.deleteFile.rejects(s3Error);

        const error = await catchErr(validateCsvFile)({
          organizationImportId,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
          importSupOrganizationLearnersJobRepositoryStub: importSupOrganizationLearnersJobRepositoryStub,
        });
        expect(error).to.eq(s3Error);
        expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({
          filename: organizationImportStub.filename,
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });
    });

    it('should save VALIDATION_ERROR status', async function () {
      // given
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);
      const csvContent = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();
      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: organizationImport.filename }, organizationId, i18n)
        .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

      // when
      await catchErr(validateCsvFile)({
        Parser: SupOrganizationLearnerParser,
        organizationImportId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.firstCall.firstArg.status).to.equal('VALIDATION_ERROR');
    });
  });
});
