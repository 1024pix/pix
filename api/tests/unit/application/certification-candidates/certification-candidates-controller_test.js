import { certificationCandidatesController } from '../../../../lib/application/certification-candidates/certification-candidates-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Controller | certifications-candidate-controller', function () {
  describe('#endAssessmentBySupervisor', function () {
    const certificationCandidateId = 2;

    it('should call the endAssessmentBySupervisor use case', async function () {
      // given
      sinon.stub(usecases, 'endAssessmentBySupervisor');
      usecases.endAssessmentBySupervisor.resolves();

      // when
      await certificationCandidatesController.endAssessmentBySupervisor({
        params: { id: certificationCandidateId },
      });

      // then
      expect(usecases.endAssessmentBySupervisor).to.have.been.calledWithExactly({
        certificationCandidateId,
      });
    });
  });
});
