import { assessmentController } from '../../../../src/school/application/assessment-controller.js';
import { Activity } from '../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../src/school/domain/models/Assessment.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

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

  describe('#getCurrentActivity', function () {
    let activity;
    const assessmentId = 104974;
    let activitySerializerStub;

    beforeEach(function () {
      activity = { assessmentId, level: Activity.levels.TUTORIAL };
      sinon.stub(usecases, 'getCurrentActivity').withArgs({ assessmentId }).resolves(activity);
      activitySerializerStub = { serialize: sinon.stub() };
      activitySerializerStub.serialize.resolvesArg(0);
    });

    it('should call the expected usecase', async function () {
      // given
      const request = {
        params: {
          id: assessmentId,
        },
      };

      // when
      const result = await assessmentController.getCurrentActivity(request, hFake, {
        activitySerializer: activitySerializerStub,
      });

      // then
      expect(result).to.be.equal(activity);
    });
  });

  describe('#create', function () {
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
        .stub(usecases, 'playMission')
        .withArgs({ missionId, organizationLearnerId: 34567 })
        .resolves(createdAssessment);
      const request = { payload: { missionId, learnerId: 34567 } };

      const result = await assessmentController.create(request, hFake);

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
});
