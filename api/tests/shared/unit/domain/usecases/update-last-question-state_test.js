import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { updateLastQuestionState } from '../../../../../src/shared/domain/usecases/update-last-question-state.js';
import { domainBuilder, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | update-last-question-state', function () {
  const assessmentId = 'assessmentId';
  const focusedChallengeId = 'focusedChallengeId';
  const notFocusedChallengeId = 'notFocusedChallengeId';
  let challengeToPlayApi;
  let assessmentRepository;
  let lastQuestionState;
  let focusedChallenge;
  let notFocusedChallenge;

  beforeEach(function () {
    challengeToPlayApi = {
      get: sinon.stub(),
    };
    assessmentRepository = {
      get: sinon.stub(),
      updateLastQuestionState: sinon.stub(),
    };

    focusedChallenge = domainBuilder.evaluation.buildChallengeToPlay({
      id: focusedChallengeId,
      focused: true,
    });

    notFocusedChallenge = domainBuilder.evaluation.buildChallengeToPlay({
      id: notFocusedChallengeId,
      focused: false,
    });
  });

  context('when lastQuestionState is ASKED', function () {
    beforeEach(function () {
      lastQuestionState = Assessment.statesOfLastQuestion.ASKED;
    });

    it('should call assessmentRepository.updateLastQuestionState', async function () {
      // Given
      assessmentRepository.updateLastQuestionState.withArgs({ id: assessmentId, lastQuestionState }).resolves();

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: focusedChallengeId,
        assessmentRepository,
        challengeToPlayApi,
      });

      // Then
      sinon.assert.called(assessmentRepository.updateLastQuestionState);
    });
  });

  context('when lastQuestionState is FOCUSEDOUT', function () {
    beforeEach(function () {
      lastQuestionState = Assessment.statesOfLastQuestion.FOCUSEDOUT;
    });

    it('should return early when challengeId is not provided', async function () {
      // Given
      challengeToPlayApi.get.withArgs(notFocusedChallengeId).resolves(notFocusedChallenge);

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: undefined,

        assessmentRepository,
        challengeToPlayApi,
      });

      // Then
      sinon.assert.notCalled(challengeToPlayApi.get);
      sinon.assert.called(assessmentRepository.updateLastQuestionState);
    });

    it('should early return if challenge is not focused', async function () {
      // Given
      challengeToPlayApi.get.withArgs(notFocusedChallengeId).resolves(notFocusedChallenge);

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: notFocusedChallengeId,

        assessmentRepository,
        challengeToPlayApi,
      });

      // Then
      sinon.assert.notCalled(assessmentRepository.updateLastQuestionState);
    });

    context('when challenge is focused', function () {
      it('should return early if the provided challenge id differs from assessment.lastChallengeId in repository', async function () {
        // Given
        challengeToPlayApi.get.withArgs(focusedChallengeId).resolves(focusedChallenge);

        const assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          lastChallengeId: notFocusedChallengeId,
          state: 'started',
        });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        // When
        await updateLastQuestionState({
          assessmentId,
          lastQuestionState,
          challengeId: focusedChallengeId,

          assessmentRepository,
          challengeToPlayApi,
        });

        // Then
        sinon.assert.notCalled(assessmentRepository.updateLastQuestionState);
      });

      it('should call assessmentRepository.updateLastQuestionState when the challenge id equals assessment.lastChallengeId', async function () {
        // Given
        challengeToPlayApi.get.withArgs(focusedChallengeId).resolves(focusedChallenge);

        const assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          lastChallengeId: focusedChallengeId,
          state: 'started',
        });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        assessmentRepository.updateLastQuestionState.withArgs({ id: assessmentId, lastQuestionState }).resolves();

        // When
        await updateLastQuestionState({
          assessmentId,
          lastQuestionState,
          challengeId: focusedChallengeId,
          assessmentRepository,
          challengeToPlayApi,
        });

        // Then
        sinon.assert.called(assessmentRepository.updateLastQuestionState);
      });
    });
  });
});
