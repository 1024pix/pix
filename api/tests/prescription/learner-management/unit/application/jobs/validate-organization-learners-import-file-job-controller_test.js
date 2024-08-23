import { ValidateOrganizationLearnersImportFileJobController } from '../../../../../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { config } from '../../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | validateOrganizationLearnersImportFileJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const handler = new ValidateOrganizationLearnersImportFileJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      //when
      const handler = new ValidateOrganizationLearnersImportFileJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'validateSiecleXmlFile');
      // given
      const handler = new ValidateOrganizationLearnersImportFileJobController();
      const data = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.validateSiecleXmlFile).to.have.been.calledOnce;
      expect(usecases.validateSiecleXmlFile).to.have.been.calledWithExactly(data);
    });
  });
});
