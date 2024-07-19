import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { uploadCsvFile } from '../../../../../../src/prescription/learner-management/domain/usecases/upload-csv-file.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { catchErr, createTempFile, expect, removeTempFile, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();
const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  const organizationId = 1;
  const userId = 2;
  let timer, fakeDate, organizationImportRepositoryStub, importStorageStub, payload, filepath, s3Filename, csvContent;

  beforeEach(async function () {
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

    organizationImportRepositoryStub = {
      save: sinon.stub(),
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
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save).to.have.been.calledOnce;
      expect(organizationImportRepositoryStub.save.firstCall.args[0]).to.deep.equals(
        new OrganizationImport({
          organizationId,
          createdBy: userId,
          createdAt: fakeDate,
          updatedAt: fakeDate,
          encoding: 'win1252',
          filename: s3Filename,
          status: IMPORT_STATUSES.UPLOADED,
        }),
      );
    });
  });
  context('when there is an upload error', function () {
    it('save UPLOAD_ERROR state in database', async function () {
      // given
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).rejects();

      importStorageStub.getParser
        .withArgs({ Parser: SupOrganizationLearnerParser, filename: s3Filename }, organizationId, i18n)
        .resolves(SupOrganizationLearnerParser.buildParser(csvContent, organizationId, i18n));

      // when
      const error = await catchErr(uploadCsvFile)({
        Parser: SupOrganizationLearnerParser,
        payload,
        userId,
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
      });

      // then
      expect(organizationImportRepositoryStub.save).to.have.been.calledOnce;
      expect(organizationImportRepositoryStub.save.firstCall.args[0]).to.deep.equals(
        new OrganizationImport({
          organizationId,
          createdBy: userId,
          createdAt: fakeDate,
          errors: [error],
          status: IMPORT_STATUSES.UPLOAD_ERROR,
          updatedAt: fakeDate,
        }),
      );
    });
  });
});
