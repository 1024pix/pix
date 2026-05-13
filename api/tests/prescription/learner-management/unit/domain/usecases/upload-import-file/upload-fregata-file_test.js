import iconv from 'iconv-lite';
import sinon from 'sinon';

import { ValidateFregataFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateFregataFileJob.js';
import { OrganizationImportStatus } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { uploadFregataFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/upload-import-file/upload-fregata-file.js';
import { FregataParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/fregata-parser.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../../../tooling/test-utils/file.js';

const i18n = getI18n();

describe('Unit | UseCase | uploadFregataFile', function () {
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
    validateFregataFileJobRepositoryStub,
    organizationImportStub,
    organizationImportSavedStub,
    organizationImportId;

  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    organizationImportId = Symbol('organizationImportId');
    s3Filename = Symbol('filename');
    csvContent = iconv.encode('fregata csv content', 'utf-8');
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

    validateFregataFileJobRepositoryStub = { performAsync: sinon.stub() };
  });

  afterEach(async function () {
    timer.restore();
    await removeTempFile(filepath);
  });

  context('when there is no error', function () {
    it('should trigger validateFregataFileJob', async function () {
      // given
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filename);
      importStorageStub.getParser
        .withArgs({ Parser: FregataParser, filename: s3Filename }, organizationId, i18n)
        .resolves({ getFileEncoding: sinon.stub() });

      // when
      await uploadFregataFile({
        payload,
        userId,
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateFregataFileJobRepository: validateFregataFileJobRepositoryStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
      expect(validateFregataFileJobRepositoryStub.performAsync).to.have.been.calledWithExactly(
        new ValidateFregataFileJob({ organizationImportId, locale: i18n.getLocale() }),
      );
    });
  });

  context('when there is an upload error', function () {
    it('should save UPLOAD_ERROR state in database', async function () {
      // given
      const errorS3 = new Error('s3ErrorUpload');
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).rejects(errorS3);

      // when
      await catchErr(uploadFregataFile)({
        payload,
        userId,
        organizationId,
        i18n,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
        validateFregataFileJobRepository: validateFregataFileJobRepositoryStub,
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
