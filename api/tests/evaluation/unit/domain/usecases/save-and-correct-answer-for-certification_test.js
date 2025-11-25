import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { EmptyAnswerError } from '../../../../../src/evaluation/domain/errors.js';
import * as correctionService from '../../../../../src/evaluation/domain/services/correction-service.js';
import { saveAndCorrectAnswerForCertification } from '../../../../../src/evaluation/domain/usecases/save-and-correct-answer-for-certification.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import {
  CertificationEndedByFinalizationError,
  CertificationEndedByInvigilatorError,
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
} from '../../../../../src/shared/domain/errors.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';
const ANSWER_STATUS_FOCUSEDOUT = AnswerStatus.FOCUSEDOUT;
const ANSWER_STATUS_OK = AnswerStatus.OK;

describe('Unit | Evaluation | Domain | Use Cases | save-and-correct-answer-for-certification', function () {
  const userId = 1;
  let assessment;
  let challenge;
  let solution;
  let validator;
  let correctAnswerValue;
  let answer;
  let clock;
  let candidate;
  let answerRepository,
    challengeRepository,
    certificationChallengeLiveAlertRepository,
    certificationEvaluationCandidateRepository;

  const nowDate = new Date('2021-03-11T11:00:04Z');
  const locale = 'fr';
  const forceOKAnswer = false;

  let dependencies;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    candidate = domainBuilder.certification.evaluation.buildCandidate({
      accessibilityAdjustmentNeeded: true,
    });
    nowDate.setMilliseconds(1);
    clock = sinon.useFakeTimers({ now: nowDate, toFake: ['Date'] });
    answerRepository = { save: sinon.stub() };
    challengeRepository = { get: sinon.stub() };
    certificationChallengeLiveAlertRepository = { getOngoingOrValidatedByChallengeIdAndAssessmentId: sinon.stub() };
    certificationEvaluationCandidateRepository = { findByAssessmentId: sinon.stub() };

    const challengeId = 'oneChallengeId';
    assessment = domainBuilder.buildAssessment({
      userId,
      lastQuestionDate: nowDate,
      type: Assessment.types.CERTIFICATION,
      answers: [],
    });
    answer = domainBuilder.buildAnswer({ assessmentId: assessment.id, value: correctAnswerValue, challengeId });
    answer.id = undefined;
    answer.result = undefined;
    answer.resultDetails = undefined;
    correctAnswerValue = '1';
    solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
    validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
    challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
    challengeRepository.get.resolves(challenge);

    dependencies = {
      forceOKAnswer,
      answerRepository,
      challengeRepository,
      certificationChallengeLiveAlertRepository,
      certificationEvaluationCandidateRepository,
      correctionService,
    };
  });

  afterEach(async function () {
    clock.restore();
  });

  context('when an answer for that challenge has already been provided', function () {
    it('should fail because ChallengeAlreadyAnsweredError', async function () {
      // given
      assessment.answers = [domainBuilder.buildAnswer({ challengeId: answer.challengeId })];

      // when
      const error = await catchErr(saveAndCorrectAnswerForCertification)({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(ChallengeAlreadyAnsweredError);
    });
  });

  context('when an answer for that challenge is not for an asked challenge', function () {
    beforeEach(function () {
      // given
      assessment.lastChallengeId = 'anotherChallenge';
    });

    it('should fail because Challenge Not Asked', async function () {
      // when
      const error = await catchErr(saveAndCorrectAnswerForCertification)({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(ChallengeNotAskedError);
    });
  });

  context('when the assessment has been ended by invigilator', function () {
    it('should throw a CertificationEndedByInvigilatorError error', async function () {
      // given
      assessment.state = Assessment.states.ENDED_BY_SUPERVISOR;

      // when
      const error = await catchErr(saveAndCorrectAnswerForCertification)({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationEndedByInvigilatorError);
    });
  });

  context('when the assessment has been ended because session was finalized', function () {
    it('should throw a CertificationEndedByFinalizationError error', async function () {
      // given
      const assessmentCertif = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: nowDate,
        state: Assessment.states.ENDED_DUE_TO_FINALIZATION,
        answers: [],
      });

      // when
      const error = await catchErr(saveAndCorrectAnswerForCertification)({
        answer,
        userId,
        assessment: assessmentCertif,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationEndedByFinalizationError);
      expect(error.message).to.equal('La session a été finalisée par votre centre de certification.');
    });
  });

  context('when no answer already exists', function () {
    let completedAnswer;
    let savedAnswer;

    beforeEach(function () {
      completedAnswer = domainBuilder.buildAnswer(answer);
      completedAnswer.id = undefined;
      completedAnswer.result = AnswerStatus.OK;
      completedAnswer.resultDetails = null;
      completedAnswer.timeSpent = 0;
      savedAnswer = domainBuilder.buildAnswer(completedAnswer);
      answerRepository.save.resolves(savedAnswer);
    });

    context('and some other context (tired of moving things around...)', function () {
      let answer;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;
      let candidate;

      beforeEach(function () {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer();
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          accessibilityAdjustmentNeeded: true,
        });

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.timeSpent = 0;
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({
          userId,
          type: Assessment.types.CERTIFICATION,
          lastQuestionDate: nowDate,
          answers: [],
        });

        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
        certificationEvaluationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await saveAndCorrectAnswerForCertification({
          answer,
          userId,
          locale,
          assessment,
          ...dependencies,
        });

        // then
        expect(answerRepository.save).to.have.been.calledWithExactly({ answer: completedAnswer });
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await saveAndCorrectAnswerForCertification({
          answer,
          userId,
          locale,
          assessment,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWithExactly(expectedArgument);
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await saveAndCorrectAnswerForCertification({
          answer,
          userId,
          locale,
          assessment,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });
  });

  context('when the user which want to save the answer is not the right user', function () {
    let answer;

    beforeEach(function () {
      answer = domainBuilder.buildAnswer();
      assessment = domainBuilder.buildAssessment({ userId: userId + 1, answers: [] });
    });

    it('should throw an error if no userId is passed', function () {
      // when
      const result = saveAndCorrectAnswerForCertification({
        answer,
        userId,
        locale,
        assessment,
        ...dependencies,
      });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

  context('compute the timeSpent and save it on the answer', function () {
    let answer;
    let answerSaved;

    it('compute the timeSpent', async function () {
      answer = domainBuilder.buildAnswer({ timeSpent: null });
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CERTIFICATION,
        answers: [],
      });
      answerSaved = domainBuilder.buildAnswer(answer);
      answerSaved.timeSpent = 5;
      answerRepository.save.resolves(answerSaved);
      certificationEvaluationCandidateRepository.findByAssessmentId
        .withArgs({ assessmentId: assessment.id })
        .resolves(candidate);

      await saveAndCorrectAnswerForCertification({
        answer,
        userId,
        locale,
        assessment,
        ...dependencies,
      });

      const expectedAnswer = domainBuilder.buildAnswer(answer);
      expectedAnswer.timeSpent = 5;
      expect(answerRepository.save).to.be.calledWith({ answer: expectedAnswer });
    });
  });

  context('when the challenge is not focused', function () {
    let focusedOutAnswer;
    let answerSaved;

    beforeEach(function () {
      // Given
      focusedOutAnswer = domainBuilder.buildAnswer({ isFocusedOut: true });
      const nonFocusedChallenge = domainBuilder.buildChallenge({
        id: focusedOutAnswer.challengeId,
        validator,
        focused: false,
      });
      challengeRepository.get.resolves(nonFocusedChallenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CERTIFICATION,
        answers: [],
      });
      answerSaved = domainBuilder.buildAnswer(focusedOutAnswer);
      answerRepository.save.resolves(answerSaved);
    });

    it('should not return focused out answer', async function () {
      // given
      certificationEvaluationCandidateRepository.findByAssessmentId
        .withArgs({ assessmentId: assessment.id })
        .resolves(candidate);

      // When
      const { result } = await saveAndCorrectAnswerForCertification({
        answer: focusedOutAnswer,
        userId,
        locale,
        assessment,
        ...dependencies,
      });

      // Then
      expect(result).not.to.equal(AnswerStatus.FOCUSEDOUT);
      expect(result).to.deep.equal(AnswerStatus.OK);
    });
  });

  context('when the challenge is focused in certification', function () {
    let answer;
    let candidate;

    context('when the candidate does not need an accessibility adjustment', function () {
      beforeEach(function () {
        // Given
        answer = domainBuilder.buildAnswer({});
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          accessibilityAdjustmentNeeded: false,
        });
        const nonFocusedChallenge = domainBuilder.buildChallenge({
          id: answer.challengeId,
          validator,
          focused: true,
        });
        challengeRepository.get.resolves(nonFocusedChallenge);
        assessment = domainBuilder.buildAssessment({
          userId,
          lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
          type: Assessment.types.CERTIFICATION,
          answers: [],
        });
        certificationEvaluationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);
      });

      [
        {
          isFocusedOut: true,
          lastQuestionState: 'focusedout',
          expected: { result: ANSWER_STATUS_FOCUSEDOUT, isFocusedOut: true },
        },
        {
          isFocusedOut: false,
          lastQuestionState: 'asked',
          expected: { result: ANSWER_STATUS_OK, isFocusedOut: false },
        },
        {
          isFocusedOut: false,
          lastQuestionState: 'focusedout',
          expected: { result: ANSWER_STATUS_FOCUSEDOUT, isFocusedOut: true },
        },
        {
          isFocusedOut: true,
          lastQuestionState: 'asked',
          expected: { result: ANSWER_STATUS_FOCUSEDOUT, isFocusedOut: true },
        },
      ].forEach(({ isFocusedOut, lastQuestionState, expected }) => {
        context(`when answer.isFocusedOut=${isFocusedOut} and lastQuestionState=${lastQuestionState}`, function () {
          it(`should return result=${expected.result.status} and isFocusedOut=${expected.isFocusedOut}`, async function () {
            // Given
            answer.isFocusedOut = isFocusedOut;
            assessment.lastQuestionState = lastQuestionState;
            answerRepository.save.callsFake(({ answer }) => answer);

            // When
            const correctedAnswer = await saveAndCorrectAnswerForCertification({
              answer: answer,
              userId,
              locale,
              assessment,
              ...dependencies,
            });

            // Then
            expect(correctedAnswer).to.deep.contain(expected);
          });
        });
      });
    });

    context('when the candidate needs an accessibility adjustment', function () {
      beforeEach(function () {
        // Given
        answer = domainBuilder.buildAnswer({});
        candidate = domainBuilder.certification.evaluation.buildCandidate({
          accessibilityAdjustmentNeeded: true,
        });
        const nonFocusedChallenge = domainBuilder.buildChallenge({
          id: answer.challengeId,
          validator,
          focused: true,
        });
        challengeRepository.get.resolves(nonFocusedChallenge);
        assessment = domainBuilder.buildAssessment({
          userId,
          lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
          type: Assessment.types.CERTIFICATION,
          answers: [],
        });
        certificationEvaluationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);
      });

      [
        {
          isFocusedOut: true,
          lastQuestionState: 'focusedout',
          expected: { result: ANSWER_STATUS_OK, isFocusedOut: true },
        },
        {
          isFocusedOut: false,
          lastQuestionState: 'asked',
          expected: { result: ANSWER_STATUS_OK, isFocusedOut: false },
        },
        {
          isFocusedOut: false,
          lastQuestionState: 'focusedout',
          expected: { result: ANSWER_STATUS_OK, isFocusedOut: true },
        },
        {
          isFocusedOut: true,
          lastQuestionState: 'asked',
          expected: { result: ANSWER_STATUS_OK, isFocusedOut: true },
        },
      ].forEach(({ isFocusedOut, lastQuestionState, expected }) => {
        context(`when answer.isFocusedOut=${isFocusedOut} and lastQuestionState=${lastQuestionState}`, function () {
          it(`should return result=${expected.result.status} and isFocusedOut=${expected.isFocusedOut}`, async function () {
            // Given
            answer.isFocusedOut = isFocusedOut;
            assessment.lastQuestionState = lastQuestionState;
            answerRepository.save.callsFake(({ answer }) => answer);

            // When
            const correctedAnswer = await saveAndCorrectAnswerForCertification({
              answer: answer,
              userId,
              locale,
              assessment,
              ...dependencies,
            });

            // Then
            expect(correctedAnswer).to.deep.contain(expected);
          });
        });
      });
    });
  });

  context('when a live alert has been set for the current challenge in V3 certification', function () {
    context('when the live alert is ongoing', function () {
      it('should throw an error', async function () {
        // given
        const challenge = domainBuilder.buildChallenge({ id: '123' });
        const assessment = domainBuilder.buildAssessment({
          userId,
          lastQuestionDate: nowDate,
          state: Assessment.states.STARTED,
          answers: [],
        });
        const answer = domainBuilder.buildAnswer({ challengeId: challenge.id });
        const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          challengeId: challenge.id,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });
        challengeRepository.get.withArgs(challenge.id).resolves(challenge);

        certificationChallengeLiveAlertRepository.getOngoingOrValidatedByChallengeIdAndAssessmentId
          .withArgs({ challengeId: challenge.id, assessmentId: assessment.id })
          .resolves(certificationChallengeLiveAlert);

        // when
        const error = await catchErr(saveAndCorrectAnswerForCertification)({
          answer,
          userId,
          assessment,
          ...dependencies,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.equal('An alert has been set.');
      });
    });

    context('when the live alert is validated', function () {
      it('should throw an error', async function () {
        // given
        const challenge = domainBuilder.buildChallenge({ id: '123' });
        const assessment = domainBuilder.buildAssessment({
          userId,
          lastQuestionDate: nowDate,
          state: Assessment.states.STARTED,
          answers: [],
        });
        const answer = domainBuilder.buildAnswer({ challengeId: challenge.id });
        const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          challengeId: challenge.id,
          status: CertificationChallengeLiveAlertStatus.VALIDATED,
        });
        challengeRepository.get.withArgs(challenge.id).resolves(challenge);

        certificationChallengeLiveAlertRepository.getOngoingOrValidatedByChallengeIdAndAssessmentId
          .withArgs({ challengeId: challenge.id, assessmentId: assessment.id })
          .resolves(certificationChallengeLiveAlert);

        // when
        const error = await catchErr(saveAndCorrectAnswerForCertification)({
          answer,
          userId,
          assessment,
          ...dependencies,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.equal('An alert has been set.');
      });
    });
  });

  context('when a challenge has an empty answer and no timeout', function () {
    it('should throw an error', async function () {
      // Given
      const emptyAnswer = domainBuilder.buildAnswer({ value: '' });
      const challenge = domainBuilder.buildChallenge({
        id: emptyAnswer.challengeId,
        validator,
      });
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.COMPETENCE_EVALUATION,
        answers: [],
      });

      // when
      const error = await catchErr(saveAndCorrectAnswerForCertification)({
        answer: emptyAnswer,
        userId,
        locale,
        assessment,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(EmptyAnswerError);
      expect(error.message).to.equal('The answer value cannot be empty');
    });
  });

  context('when a challenge has an empty answer and is timed out', function () {
    it('should not throw an error', async function () {
      // Given
      const emptyAnswer = domainBuilder.buildAnswer({ value: '', timeout: -1 });
      const challenge = domainBuilder.buildChallenge({
        id: emptyAnswer.challengeId,
        validator,
      });
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CERTIFICATION,
        answers: [],
      });
      const answerSaved = domainBuilder.buildAnswer(emptyAnswer);
      answerRepository.save.resolves(answerSaved);
      certificationEvaluationCandidateRepository.findByAssessmentId
        .withArgs({ assessmentId: assessment.id })
        .resolves(candidate);

      // when
      const { result } = await saveAndCorrectAnswerForCertification({
        answer: emptyAnswer,
        userId,
        locale,
        assessment,
        ...dependencies,
      });

      // then
      expect(result).not.to.equal(AnswerStatus.TIMEDOUT);
    });
  });
});
