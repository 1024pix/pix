import { getCorrectionForAnswer } from '../../../../lib/domain/usecases/get-correction-for-answer.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { Answer } from '../../../../src/evaluation/domain/models/Answer.js';
import { AssessmentNotCompletedError, NotFoundError } from '../../../../lib/domain/errors.js';
import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper.js';
import { LearningContentResourceNotFound } from '../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { InternalServerError } from '../../../../lib/application/http-errors.js';

describe('Unit | UseCase | getCorrectionForAnswer', function () {
  const assessmentRepository = { get: () => undefined };
  const answerRepository = { get: () => undefined };
  const correctionRepository = { getByChallengeId: () => undefined };
  const assessmentId = 1;
  const answerId = 2;
  const challengeId = 12;
  const locale = 'lang-country';
  let answer;

  beforeEach(function () {
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(answerRepository, 'get');
    sinon.stub(correctionRepository, 'getByChallengeId');

    answer = new Answer({ assessmentId, challengeId: 12, value: 'lareponse' });
    answerRepository.get.withArgs(answerId).resolves(answer);
  });

  context('when assessment is not completed', function () {
    context('and when the assessment is of type CERTIFICATION', function () {
      it('should reject with a assessment not completed error', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({
          state: 'started',
          type: Assessment.types.CERTIFICATION,
        });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        // when
        const error = await catchErr(getCorrectionForAnswer)({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId,
          userId: assessment.userId,
          locale,
        });

        // then
        expect(error).to.be.instanceOf(AssessmentNotCompletedError);
      });
    });

    context('and when the assessment is of type CAMPAIGN', function () {
      it('should return the content', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({
          state: 'started',
          type: Assessment.types.CAMPAIGN,
        });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        const correction = Symbol('A correction');
        correctionRepository.getByChallengeId
          .withArgs({ challengeId, answerValue: answer.value, userId: assessment.userId, locale })
          .resolves(correction);

        // when
        const responseSolution = await getCorrectionForAnswer({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId,
          userId: assessment.userId,
          locale,
        });

        // then
        expect(responseSolution).to.equal(correction);
      });
    });

    context('and when the assessment is COMPETENCE_EVALUATION', function () {
      it('should return the content', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({
          state: 'started',
          type: Assessment.types.COMPETENCE_EVALUATION,
        });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        const correction = Symbol('A correction');
        correctionRepository.getByChallengeId
          .withArgs({ challengeId, answerValue: answer.value, userId: assessment.userId, locale })
          .resolves(correction);

        // when
        const responseSolution = await getCorrectionForAnswer({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId,
          userId: assessment.userId,
          locale,
        });

        // then
        expect(responseSolution).to.equal(correction);
      });
    });
  });

  context('when assessment is completed', function () {
    it('should return with the correction', async function () {
      // given
      const assessment = domainBuilder.buildAssessment({ state: 'completed' });
      assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

      const correction = Symbol('A correction');
      correctionRepository.getByChallengeId
        .withArgs({ challengeId, answerValue: answer.value, userId: assessment.userId, locale })
        .resolves(correction);

      // when
      const result = await getCorrectionForAnswer({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId,
        userId: assessment.userId,
        locale,
      });

      // then
      expect(result).to.equal(correction);
    });
    context('when challenge is missing in the repository', function () {
      it('should throw a Not Found', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'completed' });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        correctionRepository.getByChallengeId
          .withArgs({ challengeId, answerValue: answer.value, userId: assessment.userId, locale })
          .rejects(new LearningContentResourceNotFound());

        // when
        const error = await catchErr(getCorrectionForAnswer)({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId,
          userId: assessment.userId,
          locale,
        });

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when the repository throws an error', function () {
      it('should throw an internal error', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'completed' });
        assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

        correctionRepository.getByChallengeId
          .withArgs({ challengeId, answerValue: answer.value, userId: assessment.userId, locale })
          .rejects(new Error());

        // when
        const error = await catchErr(getCorrectionForAnswer)({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId,
          userId: assessment.userId,
          locale,
        });

        // then
        expect(error).to.be.an.instanceOf(InternalServerError);
      });
    });
  });

  context('when user ask for correction is not the user who answered the challenge', function () {
    it('should throw a NotFound error', async function () {
      // given
      const assessment = domainBuilder.buildAssessment({ state: 'completed' });
      assessmentRepository.get.withArgs(assessmentId).resolves(assessment);

      // when
      const error = await catchErr(getCorrectionForAnswer)({
        assessmentRepository,
        answerRepository,
        correctionRepository,
        answerId,
        userId: 'wrong user id',
      });

      // then
      return expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
