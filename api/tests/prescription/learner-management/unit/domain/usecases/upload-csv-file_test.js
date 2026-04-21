import iconv from 'iconv-lite';
import sinon from 'sinon';

import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { ValidateCsvOrganizationImportFileJob } from '../../../../../../src/prescription/learner-management/domain/models/ValidateCsvOrganizationImportFileJob.js';
import { uploadCsvFile } from '../../../../../../src/prescription/learner-management/domain/usecases/upload-csv-file.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';

import { catchErr } from '../../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../../tooling/test-utils/file.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | uploadCsvFile', function () {
  const organizationId = 1;
  const userId = 2;
  let timer,
    fakeDate,
    organizationImportRepositoryStub,
    importStorageStub,
    payload,
    filepath,
    s3Filename,
    csvContent,
    importType,
    validateCsvOrganizationImportFileJobRepositoryStub,
    organizationImportStub,
    organizationImportSavedStub,
    organizationImportId;

  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    organizationImportId = Symbol('organizationImportId');
    importType = Symbol('FREGATA');
    s3Filename = Symbol('filename');
    csvContent = iconv.encode(
      `${supOrganizationLearnerImportHeader}
    Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
    O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;`,
      'utf-8',
    );
    filepath = await createTempFile('file.csv', csvContent);
    payload = { path: filepath };
    fakeDate = new Date('2019-01-10');
    timer = sinon.useFakeTimers({
      now: fakeDate,
      toFake: ['Date'],
    });

    importStorageStub = {
      sendFile: sinon.stub(),
      getParser: sinon.stub(),
    };

    organizationImportStub = { upload: sinon.stub() };

    organizationImportSavedStub = { id: organizationImportId, upload: sinon.stub() };

    sinon
      .stub(OrganizationImportStatus, 'create')
      .withArgs({ createdBy: userId, organizationId })
      .returns(organizationImportStub);

    organizationImportRepositoryStub = {
      save: sinon.stub(),
      getLastByOrganizationId: sinon.stub(),
    };
    organizationImportRepositoryStub.getLastByOrganizationId
      .withArgs(organizationId)
      .resolves(organizationImportSavedStub);

    validateCsvOrganizationImportFileJobRepositoryStub = {
      performAsync: sinon.stub(),
    };
  });

  afterEach(async function () {
    timer.restore();
    await removeTempFile(filepath);
  });

  context('when there is no errors', function () {
    it('save import state in database', async function () {
      // given
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filename);

      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: s3Filename }, organizationId, i18n)
        .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

      // when
      await uploadCsvFile({
        Parser: SupOrganizationLearnerParser,
        payload,
        userId,
        organizationId,
        i18n,
        type: importType,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateCsvOrganizationImportFileJobRepository: validateCsvOrganizationImportFileJobRepositoryStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
      expect(validateCsvOrganizationImportFileJobRepositoryStub.performAsync).to.have.been.calledWithExactly(
        new ValidateCsvOrganizationImportFileJob({
          organizationImportId,
          type: importType,
          locale: i18n.getLocale(),
        }),
      );
    });
  });

  context('when there is an upload error', function () {
    it('save UPLOAD_ERROR state in database', async function () {
      // given
      const errorS3 = new Error('s3ErrorUpload');
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).rejects(errorS3);

      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: s3Filename }, organizationId, i18n)
        .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

      // when
      await catchErr(uploadCsvFile)({
        Parser: SupOrganizationLearnerParser,
        payload,
        userId,
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
        filename: undefined,
        encoding: undefined,
        errors: [errorS3],
      });
    });
  });
});
