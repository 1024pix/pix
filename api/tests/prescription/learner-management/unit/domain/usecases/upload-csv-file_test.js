import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { uploadCsvFile } from '../../../../../../src/prescription/learner-management/domain/usecases/upload-csv-file.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, createTempFile, expect, removeTempFile, sinon } from '../../../../../test-helper.js';

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
    validateCsvOrganizationImportFileJobRepositoryStub,
    importStorageStub,
    payload,
    filepath,
    s3Filename,
    csvContent,
    organizationImportStub,
    organizationImportSavedStub,
    organizationImportId;

  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    organizationImportId = Symbol('organizationImportId');

    s3Filename = Symbol('filename');
    csvContent = `${supOrganizationLearnerImportHeader}
    Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
    O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;`;
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

    validateCsvOrganizationImportFileJobRepositoryStub = { performAsync: sinon.stub() };

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
      const result = await uploadCsvFile({
        Parser: SupOrganizationLearnerParser,
        payload,
        userId,
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
      expect(result).to.be.equals(organizationImportId);
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

    it('should save organization import with error when save job fails', async function () {
      //given
      const expectedError = new Error('jobFails');
      const parserStub = { getFileEncoding: sinon.stub() };
      const encoding = Symbol('encoding');

      validateCsvOrganizationImportFileJobRepositoryStub.performAsync.rejects(expectedError);

      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filename);
      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: s3Filename }, organizationId, i18n)
        .resolves(parserStub);

      parserStub.getFileEncoding.returns(encoding);

      // when
      await catchErr(uploadCsvFile)({
        Parser: SupOrganizationLearnerParser,
        payload,
        userId,
        organizationId,
        i18n,
        type: Symbol('type'),
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateCsvOrganizationImportFileJobRepository: validateCsvOrganizationImportFileJobRepositoryStub,
      });

      //then
      expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
        filename: s3Filename,
        encoding,
        errors: [expectedError],
      });
      expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
    });
  });
});
