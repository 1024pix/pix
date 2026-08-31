import { expect } from 'chai';
import sinon from 'sinon';

import { ValidateFregataFileJobController } from '../../../../../../../src/prescription/learner-management/application/jobs/validate-learners-file/validate-fregata-file-job-controller.js';
import { usecases } from '../../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { FregataParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/fregata-parser.js';
import { S3FileDoesNotExistError } from '../../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { config } from '../../../../../../../src/shared/config.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | ValidateFregataFileJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const handler = new ValidateFregataFileJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      //when
      const handler = new ValidateFregataFileJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase with FregataParser', async function () {
      sinon.stub(usecases, 'validateFregataFile');
      // given
      const handler = new ValidateFregataFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en' };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateFregataFile).to.have.been.calledOnceWithExactly({
        organizationImportId: data.organizationImportId,
        i18n: getI18n(data.locale),
        Parser: FregataParser,
      });
    });

    it('should not throw when error is from domain', async function () {
      const error = new S3FileDoesNotExistError();
      sinon.stub(usecases, 'validateFregataFile').rejects(error);

      // given
      const warnStub = sinon.stub();
      const handler = new ValidateFregataFileJobController({ logger: { warn: warnStub } });
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en' };

      // when
      await handler.handle({ data });

      // then
      expect(warnStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'validateFregataFile').rejects(error);

      // given
      const handler = new ValidateFregataFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en' };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
    });
  });
});
