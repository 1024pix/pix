import { ValidateOrganizationLearnersImportFileJobController } from '../../../../../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | validateOrganizationLearnersImportFileJobController', function () {

  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'validateSiecleXmlFile');
      // given
      const handler = new ValidateOrganizationLearnersImportFileJobController();
      const computeImportOrganizationLearnersJob = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle(computeImportOrganizationLearnersJob);

      // then
      expect(usecases.validateSiecleXmlFile).to.have.been.calledOnce;
      expect(usecases.validateSiecleXmlFile).to.have.been.calledWithExactly(computeImportOrganizationLearnersJob);
    });
  });
});
