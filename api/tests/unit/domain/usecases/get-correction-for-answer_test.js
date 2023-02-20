import getCorrectionForAnswer from '../../../../lib/domain/usecases/get-correction-for-answer';
import Assessment from '../../../../lib/domain/models/Assessment';
import Answer from '../../../../lib/domain/models/Answer';
import { AssessmentNotCompletedError, NotFoundError } from '../../../../lib/domain/errors';
import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';

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

    answer = new Answer({ assessmentId, challengeId: 12 });
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
          .withArgs({ challengeId, userId: assessment.userId, locale })
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
          .withArgs({ challengeId, userId: assessment.userId, locale })
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
        .withArgs({ challengeId, userId: assessment.userId, locale })
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
