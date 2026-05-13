import iconv from 'iconv-lite';
import sinon from 'sinon';

import { SUP_IMPORT_TYPES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { ValidateSupFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSupFileJob.js';
import { OrganizationImportStatus } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { uploadSupFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/upload-import-file/upload-sup-file.js';
import { SupHeader } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/headers/sup-header.js';
import { SupParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/sup-parser.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../../../tooling/test-utils/file.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupHeader(i18n).columns.map((column) => column.name).join(';');

describe('Unit | UseCase | uploadSupFile', function () {
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
    validateSupFileJobRepositoryStub,
    organizationImportStub,
    organizationImportSavedStub,
    organizationImportId;

  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    organizationImportId = Symbol('organizationImportId');
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

    validateSupFileJobRepositoryStub = { performAsync: sinon.stub() };
  });

  afterEach(async function () {
    timer.restore();
    await removeTempFile(filepath);
  });

  context('when there is no error', function () {
    it('should trigger validateSupFileJob with type ADDITIONAL_STUDENT', async function () {
      // given
      const type = SUP_IMPORT_TYPES.ADDITIONAL_STUDENT;
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filename);
      importStorageStub.getParser
        .withArgs({ Parser: SupParser, filename: s3Filename }, organizationId, i18n)
        .resolves(SupParser.buildParser(csvContent, organizationId, i18n));

      // when
      await uploadSupFile({
        payload,
        userId,
        organizationId,
        i18n,
        type,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateSupFileJobRepository: validateSupFileJobRepositoryStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
      expect(validateSupFileJobRepositoryStub.performAsync).to.have.been.calledWithExactly(
        new ValidateSupFileJob({ organizationImportId, type, locale: i18n.getLocale() }),
      );
    });

    it('should trigger validateSupFileJob with type REPLACE_STUDENT', async function () {
      // given
      const type = SUP_IMPORT_TYPES.REPLACE_STUDENT;
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filename);
      importStorageStub.getParser
        .withArgs({ Parser: SupParser, filename: s3Filename }, organizationId, i18n)
        .resolves(SupParser.buildParser(csvContent, organizationId, i18n));

      // when
      await uploadSupFile({
        payload,
        userId,
        organizationId,
        i18n,
        type,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateSupFileJobRepository: validateSupFileJobRepositoryStub,
      });

      // then
      expect(validateSupFileJobRepositoryStub.performAsync).to.have.been.calledWithExactly(
        new ValidateSupFileJob({ organizationImportId, type, locale: i18n.getLocale() }),
      );
    });
  });

  context('when there is an upload error', function () {
    it('should save UPLOAD_ERROR state in database', async function () {
      // given
      const errorS3 = new Error('s3ErrorUpload');
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).rejects(errorS3);

      // when
      await catchErr(uploadSupFile)({
        payload,
        userId,
        organizationId,
        i18n,
        type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateSupFileJobRepository: validateSupFileJobRepositoryStub,
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
