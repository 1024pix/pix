import { expect, hFake, sinon } from '../../../test-helper.js';
import { assessmentController } from '../../../../src/school/application/assessment-controller.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { Activity } from '../../../../src/school/domain/models/Activity.js';

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
});
