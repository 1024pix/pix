import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { getCurrentActivity } from '../../../../../src/school/domain/usecases/get-current-activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { NotInProgressAssessmentError } from '../../../../../src/school/domain/school-errors.js';

describe('Unit | Domain | Use Cases | get-current-activity', function () {
  context('when assessment is completed', function () {
    it('should throw an NotInProgressAssessmentError', async function () {
      const assessmentRepository = { get: sinon.stub() };
      assessmentRepository.get.resolves(domainBuilder.buildAssessment({ state: Assessment.states.COMPLETED }));

      const assessmentId = 'id_assessment';

      const error = await catchErr(getCurrentActivity)({ assessmentId, assessmentRepository });

      expect(error).to.be.instanceOf(NotInProgressAssessmentError);
      expect(assessmentRepository.get).to.have.been.calledWithExactly(assessmentId);
    });
  });
  context('when assessment is in progress', function () {
    it('should call the activityRepository with an assessment id equal to id_assessment ', async function () {
      const activityRepository = { getLastActivity: sinon.stub() };
      const assessmentRepository = { get: sinon.stub() };
      assessmentRepository.get.resolves(domainBuilder.buildAssessment({ state: Assessment.states.STARTED }));
      const assessmentId = 'id_assessment';

      await getCurrentActivity({ assessmentId, activityRepository, assessmentRepository });

      expect(assessmentRepository.get).to.have.been.calledWithExactly(assessmentId);
      expect(activityRepository.getLastActivity).to.have.been.calledWithExactly(assessmentId);
    });
  });
});
