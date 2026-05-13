import sinon from 'sinon';

import { ValidateSupFileJobController } from '../../../../../../../src/prescription/learner-management/application/jobs/validate-learners-file/validate-sup-file-job-controller.js';
import { SUP_IMPORT_TYPES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { usecases } from '../../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { SupParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/sup-parser.js';
import { S3FileDoesNotExistError } from '../../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { config } from '../../../../../../../src/shared/config.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | ValidateSupFileJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const handler = new ValidateSupFileJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      //when
      const handler = new ValidateSupFileJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase with SupParser on type `ADDITIONAL_STUDENT`', async function () {
      sinon.stub(usecases, 'validateSupFile');
      // given
      const handler = new ValidateSupFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateSupFile).to.have.been.calledOnceWithExactly({
        organizationImportId: data.organizationImportId,
        i18n: getI18n(data.locale),
        type: data.type,
        Parser: SupParser,
      });
    });

    it('should call usecase with SupParser on type `REPLACE_STUDENT`', async function () {
      sinon.stub(usecases, 'validateSupFile');
      // given
      const handler = new ValidateSupFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.REPLACE_STUDENT };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateSupFile).to.have.been.calledOnceWithExactly({
        organizationImportId: data.organizationImportId,
        i18n: getI18n(data.locale),
        type: data.type,
        Parser: SupParser,
      });
    });

    it('should not throw when error is from domain', async function () {
      const error = new S3FileDoesNotExistError();
      sinon.stub(usecases, 'validateSupFile').rejects(error);

      // given
      const warnStub = sinon.stub();
      const handler = new ValidateSupFileJobController({ logger: { warn: warnStub } });
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT };

      // when
      await handler.handle({ data });

      // then
      expect(warnStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'validateSupFile').rejects(error);

      // given
      const handler = new ValidateSupFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
    });
  });
});
