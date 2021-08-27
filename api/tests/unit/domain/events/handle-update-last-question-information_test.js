const { catchErr, expect, sinon } = require('../../../test-helper');
const handleUpdateLastQuestionInformation = require('../../../../lib/domain/events/handle-update-last-question-information');
const NewChallengeAsked = require('../../../../lib/domain/events/NewChallengeAsked');

describe('Unit | Domain | Events | handle-last-question-information', function() {

  let dependencies;
  let assessmentRepository;
  beforeEach(function() {
    assessmentRepository = {
      updateLastChallengeIdAsked: sinon.stub(),
      updateLastQuestionState: sinon.stub(),
    };

    dependencies = {
      assessmentRepository,
    };
  });

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';

    // when
    const error = await catchErr(handleUpdateLastQuestionInformation)(
      { event, ...dependencies },
    );

    // then
    expect(error).not.to.be.null;
  });

  context('when currentChallengeId is not the same than the new challengeId', function() {
    it('update the last challenge id if it is not the same', async function() {
      // given
      const assessmentId = 1234;
      const challengeId = 'challenge2';
      const currentChallengeId = 'challenge1';
      const event = new NewChallengeAsked({
        assessmentId,
        challengeId,
        currentChallengeId,
      });

      // when
      await handleUpdateLastQuestionInformation({ event, ...dependencies });

      // then
      expect(assessmentRepository.updateLastChallengeIdAsked).to.have.been.calledWithExactly(
        { id: assessmentId, lastChallengeId: challengeId },
      );
    });
    it('update the lastQuestionState to set at "asked"', async function() {
      // given
      const assessmentId = 1234;
      const challengeId = 'challenge2';
      const currentChallengeId = 'challenge1';
      const event = new NewChallengeAsked({
        assessmentId,
        challengeId,
        currentChallengeId,
      });

      // when
      await handleUpdateLastQuestionInformation({ event, ...dependencies });

      // then
      expect(assessmentRepository.updateLastQuestionState).to.have.been.calledWithExactly(
        { id: assessmentId, lastQuestionState: 'asked' },
      );
    });
  });

  it('do not update the last challenge Id when challengeId and currentChallengeId is the same', async function() {
    // given
    const assessmentId = 1234;
    const challengeId = 'challenge1';
    const currentChallengeId = 'challenge1';
    const event = new NewChallengeAsked({
      assessmentId,
      challengeId,
      currentChallengeId,
    });

    // when
    await handleUpdateLastQuestionInformation({ event, ...dependencies });

    // then
    expect(assessmentRepository.updateLastChallengeIdAsked).to.have.not.been.called;

  });

});
