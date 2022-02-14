const { expect, sinon, catchErr } = require('../../test-helper');
const usecases = require('../../../lib/domain/usecases/index');
const { eventDispatcher } = require('../../../lib/domain/events/');
const ChallengeNeutralized = require('../../../lib/domain/events/ChallengeNeutralized');
const { neutralizeAnswers } = require('../../../scripts/neutralize-answers-after-invalid-challenges');

describe('Acceptance | Scripts | neutralize-answers-after-invalid-challenges.js', function () {
  describe('#neutralizeAnswers', function () {
    it('should call neutralizeChallengeUseCase', async function () {
      // given
      const answers = [
        {
          certificationCourseId: null,
          challengeId: null,
        },
      ];
      const userId = 1;
      const neutralizeChallengeUseCaseStub = sinon.stub(usecases, 'neutralizeChallenge').rejects();

      // when
      await catchErr(neutralizeAnswers)(answers, userId);

      // then
      expect(neutralizeChallengeUseCaseStub).to.have.been.calledOnce;
    });
    it('should call eventDispatcher', async function () {
      // given
      const answers = [
        {
          certificationCourseId: null,
          challengeId: null,
        },
      ];
      const userId = 1;
      sinon.stub(usecases, 'neutralizeChallenge').returns(new ChallengeNeutralized({}));
      const eventDispatcherStub = sinon.stub(eventDispatcher, 'dispatch').rejects();

      // when
      await catchErr(neutralizeAnswers)(answers, userId);

      // then
      expect(eventDispatcherStub).to.have.been.calledOnce;
    });
  });
});
