import { expect, hFake, sinon } from '../../../../test-helper.js';
import { assessmentController } from '../../../../../src/school/application/assessments/assessment-controller.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';

describe('Unit | Controller | assessment-controller', function () {
  describe('#getNextChallengeForPix1d', function () {
    it('should call the expected usecase', async function () {
      const assessmentId = 104974;
      const challenge = { id: 'rec1', instruction: '1st challenge for Pix1d' };
      const challengeSerializerStub = { serialize: sinon.stub() };
      challengeSerializerStub.serialize.resolves(challenge);

      // given
      const request = {
        params: {
          id: assessmentId,
        },
      };

      sinon.stub(usecases, 'getNextChallenge').withArgs({ assessmentId }).resolves(challenge);

      // when
      const result = await assessmentController.getNextChallengeForPix1d(request, hFake, {
        challengeSerializer: challengeSerializerStub,
      });

      // then
      expect(result).to.be.equal(challenge);
    });
  });

  describe('#createForPix1d', function () {
    it('should call the expected usecase', async function () {
      const missionId = 'mission-id';
      const assessmentSerializer = { serialize: sinon.stub() };
      const createdAssessment = Symbol('created-assessment');
      assessmentSerializer.serialize.withArgs(createdAssessment).resolves(Symbol('serialized-assessment'));
      sinon
        .stub(usecases, 'createMissionAssessment')
        .withArgs({ missionId, organizationLearnerId: 34567 })
        .resolves(createdAssessment);
      const request = { payload: { missionId, learnerId: 34567 } };

      const result = await assessmentController.createForPix1d(request, hFake, {
        assessmentSerializer,
      });

      expect(result.statusCode).to.be.equal(201);
      expect(assessmentSerializer.serialize).to.have.been.calledWithExactly(createdAssessment);
    });
  });
});
