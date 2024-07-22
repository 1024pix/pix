import { AnswerStatus, Examiner, Validation, ValidatorAlwaysOK } from '../../../../../lib/domain/models/index.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { NotInProgressAssessmentError } from '../../../../../src/school/domain/school-errors.js';
import { correctAnswer } from '../../../../../src/school/domain/services/correct-answer.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import { ChallengeNotAskedError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
  mockLearningContent,
} from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCases | correct-answer', function () {
  context('when there is assessmentId', function () {
    context('nominal case', function () {
      let activityAnswer;
      let activity;
      let challenge;
      let assessment;

      beforeEach(async function () {
        challenge = learningContentBuilder.buildChallenge();
        const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });
        activityAnswer = domainBuilder.buildActivityAnswer({
          id: null,
          challengeId: challenge.id,
        });

        const learningContent = {
          challenges: [challenge],
          skills: [skill],
        };

        mockLearningContent(learningContent);

        assessment = databaseBuilder.factory.buildAssessment({
          state: Assessment.states.STARTED,
          lastChallengeId: challenge.id,
        });

        activity = databaseBuilder.factory.buildActivity({ assessmentId: assessment.id });
        await databaseBuilder.commit();
      });

      context('and answer is correct', function () {
        it('returns newly created answer with OK status', async function () {
          // given
          const alwaysTrueExaminer = new Examiner({ validator: new ValidatorAlwaysOK() });

          // when
          const record = await correctAnswer({
            activityAnswer,
            assessmentId: assessment.id,
            challengeRepository,
            assessmentRepository,
            activityAnswerRepository,
            activityRepository,
            examiner: alwaysTrueExaminer,
          });

          const savedAnswer = await knex('activity-answers').where({ id: record.id }).first();

          // then
          expect(savedAnswer.challengeId).to.equal(challenge.id);
          expect(savedAnswer.activityId).to.equal(activity.id);
          expect(record.result).to.deep.equal(AnswerStatus.OK);
        });
      });
      context('and answer is incorrect', function () {
        it('returns newly created answer with KO status', async function () {
          // given
          const alwaysFalseExaminer = new Examiner({
            validator: {
              assess: () =>
                new Validation({
                  result: AnswerStatus.KO,
                  resultDetails: null,
                }),
            },
          });

          // when
          const record = await correctAnswer({
            activityAnswer,
            assessmentId: assessment.id,
            challengeRepository,
            assessmentRepository,
            activityAnswerRepository,
            activityRepository,
            examiner: alwaysFalseExaminer,
          });

          const savedAnswer = await knex('activity-answers').where({ id: record.id }).first();

          // then
          expect(savedAnswer.challengeId).to.equal(challenge.id);
          expect(savedAnswer.activityId).to.equal(activity.id);
          expect(record.result).to.deep.equal(AnswerStatus.KO);
        });
      });
    });
    it('should return error when challengeId doesnt match assessment lastChallengeId', async function () {
      const assessment = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.STARTED,
        lastChallengeId: 'otherChallengeId',
      });

      const activityAnswer = databaseBuilder.factory.buildActivityAnswer({
        challengeId: 'oneChallengeId',
        activityId: null,
        result: null,
        resultDetails: null,
      });
      await databaseBuilder.commit();

      const error = await catchErr(correctAnswer)({
        activityAnswer,
        assessmentId: assessment.id,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
        assessmentRepository,
      });

      expect(error).to.be.instanceOf(ChallengeNotAskedError);
      expect(error.message).to.equal('La question à laquelle vous essayez de répondre ne vous a pas été proposée.');
    });

    it('should return error when lastChallengeId is missing', async function () {
      const assessment = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.STARTED,
      });

      const activityAnswer = databaseBuilder.factory.buildActivityAnswer({
        challengeId: 'oneChallengeId',
        activityId: null,
        result: null,
        resultDetails: null,
      });
      await databaseBuilder.commit();

      const error = await catchErr(correctAnswer)({
        activityAnswer,
        assessmentId: assessment.id,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
        assessmentRepository,
      });

      expect(error).to.be.instanceOf(ChallengeNotAskedError);
      expect(error.message).to.equal('La question à laquelle vous essayez de répondre ne vous a pas été proposée.');
    });

    it('should return error when assessment is finished', async function () {
      const challengeId = 'oneChallengeId';

      const assessment = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.COMPLETED,
        lastChallengeId: 'lastchallengeId-for-completedAssessment',
      });

      const activityAnswer = databaseBuilder.factory.buildActivityAnswer({
        challengeId,
        activityId: null,
        result: null,
        resultDetails: null,
      });
      await databaseBuilder.commit();

      const error = await catchErr(correctAnswer)({
        activityAnswer,
        assessmentId: assessment.id,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
        assessmentRepository,
      });

      expect(error).to.be.instanceOf(NotInProgressAssessmentError);
      expect(error.message).to.equal(`Mission assessment closed for ${assessment.id}`);
    });
  });

  context('when there is no match between assessment and the provided id', function () {
    it('throws NotFoundError', async function () {
      // given
      const challenge = learningContentBuilder.buildChallenge();
      const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });
      const learningContent = {
        challenges: [challenge],
        skills: [skill],
      };
      mockLearningContent(learningContent);

      const assessmentId = 10;
      const activityAnswer = domainBuilder.buildActivityAnswer({
        id: null,
        challengeId: challenge.id,
      });

      // when
      const error = await catchErr(correctAnswer)({
        activityAnswer,
        assessmentId,
        challengeRepository,
        assessmentRepository,
        activityAnswerRepository,
        activityRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal("L'assessment n'existe pas ou son accès est restreint");
    });
  });
});
