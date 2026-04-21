import sinon from 'sinon';

import { ValidateCommonOrganizationLearnersImportFileJobController } from '../../../../../../src/prescription/learner-management/application/jobs/validate-common-organization-learners-import-file-job-controller.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { S3FileDoesNotExistError } from '../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { config } from '../../../../../../src/shared/config.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | validateOrganizationLearnersImportFileJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const handler = new ValidateCommonOrganizationLearnersImportFileJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      //when
      const handler = new ValidateCommonOrganizationLearnersImportFileJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'validateOrganizationLearnersFile');
      // given
      const handler = new ValidateCommonOrganizationLearnersImportFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateOrganizationLearnersFile).to.have.been.calledOnce;
      expect(usecases.validateOrganizationLearnersFile).to.have.been.calledWithExactly(data);
    });

    it('should not throw when error is from domain', async function () {
      const error = new S3FileDoesNotExistError();
      sinon.stub(usecases, 'validateOrganizationLearnersFile').rejects(error);

      // given
      const warnStub = sinon.stub();
      const handler = new ValidateCommonOrganizationLearnersImportFileJobController({ logger: { warn: warnStub } });
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle({ data });

      // then
      expect(warnStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'validateOrganizationLearnersFile').rejects(error);

      // given
      const handler = new ValidateCommonOrganizationLearnersImportFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
    });
  });
});
