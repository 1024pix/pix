import { ImportOrganizationLearnersJobController } from '../../../../../../src/prescription/learner-management/application/jobs/import-organization-learners-job-controller.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | importOrganizationLearnersJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'addOrUpdateOrganizationLearners');
      // given
      const handler = new ImportOrganizationLearnersJobController();
      const computeImportOrganizationLearnersJob = { organizationImportId: Symbol('organizationImportId') };

      // when
      await handler.handle(computeImportOrganizationLearnersJob);

      // then
      expect(usecases.addOrUpdateOrganizationLearners).to.have.been.calledOnce;
      expect(usecases.addOrUpdateOrganizationLearners).to.have.been.calledWithExactly(
        computeImportOrganizationLearnersJob,
      );
    });
  });
});
