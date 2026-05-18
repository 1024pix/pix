import sinon from 'sinon';

import { ValidateGenericFileJobController } from '../../../../../../../src/prescription/learner-management/application/jobs/validate-learners-file/validate-generic-file-job-controller.js';
import { usecases } from '../../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { S3FileDoesNotExistError } from '../../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { config } from '../../../../../../../src/shared/config.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | ValidateGenericFileJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const handler = new ValidateGenericFileJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      //when
      const handler = new ValidateGenericFileJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'validateGenericFile');
      // given
      const handler = new ValidateGenericFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateGenericFile).to.have.been.calledOnceWithExactly({
        organizationImportId: data.organizationImportId,
      });
    });

    it('should not throw when error is from domain', async function () {
      const error = new S3FileDoesNotExistError();
      sinon.stub(usecases, 'validateGenericFile').rejects(error);

      // given
      const warnStub = sinon.stub();
      const handler = new ValidateGenericFileJobController({ logger: { warn: warnStub } });
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle({ data });

      // then
      expect(warnStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'validateGenericFile').rejects(error);

      // given
      const handler = new ValidateGenericFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
    });
  });
});
