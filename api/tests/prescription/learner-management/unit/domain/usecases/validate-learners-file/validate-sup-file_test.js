import { expect } from 'chai';
import iconv from 'iconv-lite';
import sinon from 'sinon';

import { IMPORT_STATUSES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { ImportFromSupJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromSupJob.js';
import { OrganizationImportStatus } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { validateSupFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/validate-learners-file/validate-sup-file.js';
import { SupHeader } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/headers/sup-header.js';
import { SupParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/sup-parser.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupHeader(i18n).columns.map((column) => column.name).join(';');

describe('Unit | UseCase | validateSupFile', function () {
  let organizationImportId, organizationId;
  let csvContent,
    expectedWarnings,
    organizationImport,
    organizationImportRepositoryStub,
    importStorageStub,
    importFromSupJobRepositoryStub;

  beforeEach(function () {
    organizationImportId = Symbol('organizationImportId');
    organizationId = 1234;
    csvContent = iconv.encode(
      `${supOrganizationLearnerImportHeader}
    Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
    `.trim(),
      'utf-8',
    );

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

    importFromSupJobRepositoryStub = {
      performAsync: sinon.stub(),
    };
  });

  context('when there is no errors', function () {
    it('should save validated state', async function () {
      // given
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

      importStorageStub.getParser
        .withArgs({ Parser: SupParser, filename: organizationImport.filename }, organizationId, i18n)
        .resolves(SupParser.buildParser(csvContent, organizationId, i18n));

      // when
      await validateSupFile({
        Parser: SupParser,
        organizationImportId,
        i18n,
        importFromSupJobRepository: importFromSupJobRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save).to.have.been.calledOnceWithExactly(organizationImport);
      expect(organizationImport.status).to.equal(IMPORT_STATUSES.VALIDATED);
      expect(organizationImport.errors).to.deep.equal(expectedWarnings);
    });

    it('should perform sup job', async function () {
      // given
      const type = Symbol('type');
      organizationImportRepositoryStub.get.withArgs(organizationImportId).resolves(organizationImport);

      importStorageStub.getParser
        .withArgs({ Parser: SupParser, filename: organizationImport.filename }, organizationId, i18n)
        .resolves(SupParser.buildParser(csvContent, organizationId, i18n));

      // when
      await validateSupFile({
        Parser: SupParser,
        type,
        organizationImportId,
        importFromSupJobRepository: importFromSupJobRepositoryStub,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(importFromSupJobRepositoryStub.performAsync).to.have.been.calledOnceWithExactly(
        new ImportFromSupJob({
          type,
          locale: 'fr',
          organizationImportId,
        }),
      );
    });
  });

  context('when there is errors', function () {
    let organizationImportStub;

    beforeEach(function () {
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
        const error = await catchErr(validateSupFile)({
          organizationImportId,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
          importFromSupJobRepository: importFromSupJobRepositoryStub,
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
          .withArgs({ Parser: SupParser, filename: organizationImport.filename }, organizationId, i18n)
          .resolves(parserStub);
        parserStub.parse.rejects(new AggregateImportError([new Error('parsing')]));
        const s3Error = new Error('s3 error');
        importStorageStub.deleteFile.rejects(s3Error);

        const error = await catchErr(validateSupFile)({
          organizationImportId,
          organizationImportRepository: organizationImportRepositoryStub,
          importStorage: importStorageStub,
          importFromSupJobRepository: importFromSupJobRepositoryStub,
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
      const csvContent = iconv.encode(
        `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim(),
        'utf-8',
      );
      importStorageStub.getParser
        .withArgs({ Parser: SupParser, filename: organizationImport.filename }, organizationId, i18n)
        .resolves(SupParser.buildParser(csvContent, organizationId, i18n));

      // when
      await catchErr(validateSupFile)({
        Parser: SupParser,
        organizationImportId,
        i18n,
        importFromSupJobRepository: importFromSupJobRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.firstCall.firstArg.status).to.equal('VALIDATION_ERROR');
    });
  });
});
