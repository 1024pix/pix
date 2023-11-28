import { expect, hFake, sinon } from '../../../test-helper.js';
import { assessmentController } from '../../../../src/school/application/assessment-controller.js';
import { usecases } from '../../../../src/school/shared/usecases/index.js';
import { Assessment } from '../../../../src/school/domain/models/Assessment.js';

describe('Integration | Controller | assessment-controller', function () {
  describe('#createForPix1d', function () {
    it('should call the expected usecase and return the serialized assessment', async function () {
      const missionId = 'mission-id';
      const assessmentId = 1234;
      const organizationLearnerId = 5678;
      const createdAssessment = new Assessment({
        id: assessmentId,
        missionId,
        assessmentId,
        organizationLearnerId,
        state: Assessment.states.STARTED,
      });
      sinon
        .stub(usecases, 'createMissionAssessment')
        .withArgs({ missionId, organizationLearnerId: 34567 })
        .resolves(createdAssessment);
      const request = { payload: { missionId, learnerId: 34567 } };

      const result = await assessmentController.createForPix1d(request, hFake);

      expect(result.statusCode).to.be.equal(201);
      expect(result.source.data).to.deep.equal({
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
