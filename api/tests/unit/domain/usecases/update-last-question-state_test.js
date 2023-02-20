import { sinon, domainBuilder } from '../../../test-helper';
import Assessment from '../../../../lib/domain/models/Assessment';
import updateLastQuestionState from '../../../../lib/domain/usecases/update-last-question-state';

describe('Unit | UseCase | update-last-question-state', function () {
  const assessmentId = 'assessmentId';
  const focusedChallengeId = 'focusedChallengeId';
  const notFocusedChallengeId = 'notFocusedChallengeId';
  let domainTransaction;
  let challengeRepository;
  let assessmentRepository;
  let lastQuestionState;
  let focusedChallenge;
  let notFocusedChallenge;

  beforeEach(function () {
    domainTransaction = Symbol('domainTransaction');
    challengeRepository = {
      get: sinon.stub(),
    };
    assessmentRepository = {
      get: sinon.stub(),
      updateLastQuestionState: sinon.stub(),
    };

    focusedChallenge = domainBuilder.buildChallenge({
      id: focusedChallengeId,
      focused: true,
    });

    notFocusedChallenge = domainBuilder.buildChallenge({
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
      assessmentRepository.updateLastQuestionState
        .withArgs({ id: assessmentId, lastQuestionState, domainTransaction })
        .resolves();

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: focusedChallengeId,
        domainTransaction,
        assessmentRepository,
        challengeRepository,
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
      challengeRepository.get.withArgs(notFocusedChallengeId, domainTransaction).resolves(notFocusedChallenge);

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: undefined,
        domainTransaction,
        assessmentRepository,
        challengeRepository,
      });

      // Then
      sinon.assert.notCalled(challengeRepository.get);
      sinon.assert.called(assessmentRepository.updateLastQuestionState);
    });

    it('should early return if challenge is not focused', async function () {
      // Given
      challengeRepository.get.withArgs(notFocusedChallengeId, domainTransaction).resolves(notFocusedChallenge);

      // When
      await updateLastQuestionState({
        assessmentId,
        lastQuestionState,
        challengeId: notFocusedChallengeId,
        domainTransaction,
        assessmentRepository,
        challengeRepository,
      });

      // Then
      sinon.assert.notCalled(assessmentRepository.updateLastQuestionState);
    });

    context('when challenge is focused', function () {
      it('should return early if the provided challenge id differs from assessment.lastChallengeId in repository', async function () {
        // Given
        challengeRepository.get.withArgs(focusedChallengeId, domainTransaction).resolves(focusedChallenge);

        const assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          lastChallengeId: notFocusedChallengeId,
          state: 'started',
        });
        assessmentRepository.get.withArgs(assessmentId, domainTransaction).resolves(assessment);

        // When
        await updateLastQuestionState({
          assessmentId,
          lastQuestionState,
          challengeId: focusedChallengeId,
          domainTransaction,
          assessmentRepository,
          challengeRepository,
        });

        // Then
        sinon.assert.notCalled(assessmentRepository.updateLastQuestionState);
      });

      it('should call assessmentRepository.updateLastQuestionState when the challenge id equals assessment.lastChallengeId', async function () {
        // Given
        challengeRepository.get.withArgs(focusedChallengeId, domainTransaction).resolves(focusedChallenge);

        const assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          lastChallengeId: focusedChallengeId,
          state: 'started',
        });
        assessmentRepository.get.withArgs(assessmentId, domainTransaction).resolves(assessment);

        assessmentRepository.updateLastQuestionState
          .withArgs({ id: assessmentId, lastQuestionState, domainTransaction })
          .resolves();

        // When
        await updateLastQuestionState({
          assessmentId,
          lastQuestionState,
          challengeId: focusedChallengeId,
          domainTransaction,
          assessmentRepository,
          challengeRepository,
        });

        // Then
        sinon.assert.called(assessmentRepository.updateLastQuestionState);
      });
    });
  });
});
