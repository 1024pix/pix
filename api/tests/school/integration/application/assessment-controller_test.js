import { assessmentController } from '../../../../src/school/application/assessment-controller.js';
import { Assessment } from '../../../../src/school/domain/models/Assessment.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Integration | Controller | assessment-controller', function () {
  describe('#getById', function () {
    it('should call the expected usecase and return the serialized assessment', async function () {
      const missionId = 'mission-id';
      const assessmentId = 1234;
      const organizationLearnerId = 5678;
      const createdMissionAssessment = new Assessment({
        missionId,
        id: assessmentId,
        organizationLearnerId,
        state: Assessment.states.STARTED,
      });
      sinon.stub(usecases, 'getAssessmentById').withArgs({ assessmentId }).resolves(createdMissionAssessment);
      const request = { params: { id: assessmentId } };

      const result = await assessmentController.getById(request, hFake);
      expect(result.data).to.deep.equal({
        id: assessmentId.toString(),
        attributes: {
          'mission-id': missionId,
          'organization-learner-id': organizationLearnerId,
          state: Assessment.states.STARTED,
        },
        type: 'assessments',
      });
    });
  });
});
