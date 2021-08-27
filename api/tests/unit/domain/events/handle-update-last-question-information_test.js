const { catchErr, expect, sinon } = require('../../../test-helper');
const handleUpdateLastQuestionInformation = require('../../../../lib/domain/events/handle-update-last-question-information');
const NewChallengeAsked = require('../../../../lib/domain/events/NewChallengeAsked');

describe('Unit | Domain | Events | handle-last-question-information', function() {

  let dependencies;
  let assessmentRepository;
  beforeEach(function() {
    assessmentRepository = { updateLastChallengeIdAsked: sinon.stub() };

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

  it('update the last challenge Id', async function() {
    // given
    const assessmentId = 1234;
    const challengeId = 'challengeRec123';
    const event = new NewChallengeAsked({
      assessmentId,
      challengeId,
      currentQuestionState: 'asked',
    });

    // when
    await handleUpdateLastQuestionInformation({ event, ...dependencies });

    // then
    expect(assessmentRepository.updateLastChallengeIdAsked).to.have.been.calledWithExactly(
      { id: assessmentId, lastChallengeId: challengeId },
    );
  });

  it('do not update the last challenge Id when there is no challengeId', async function() {
    // given
    const assessmentId = 1234;
    const challengeId = null;
    const event = new NewChallengeAsked({
      assessmentId,
      challengeId,
      currentQuestionState: 'asked',
    });

    // when
    await handleUpdateLastQuestionInformation({ event, ...dependencies });

    // then
    expect(assessmentRepository.updateLastChallengeIdAsked).to.have.not.been.called;

  });

});
