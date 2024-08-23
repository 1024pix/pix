import { usecases } from '../../../../../../lib/domain/usecases/index.js';
import { ComputeCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/compute-certificability-job-controller.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | computeCertificabilityJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'computeOrganizationLearnerCertificability');
      // given
      const handler = new ComputeCertificabilityJobController();
      const data = { organizationLearnerId: Symbol('organizationLearnerId') };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.computeOrganizationLearnerCertificability).to.have.been.calledOnce;
      expect(usecases.computeOrganizationLearnerCertificability).to.have.been.calledWithExactly(data);
    });
  });
});
