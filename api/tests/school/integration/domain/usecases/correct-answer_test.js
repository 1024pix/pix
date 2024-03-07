import { ChallengeNotAskedError, NotFoundError } from '../../../../../lib/domain/errors.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { NotInProgressAssessmentError } from '../../../../../src/school/domain/school-errors.js';
import { correctAnswer } from '../../../../../src/school/domain/usecases/correct-answer.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as sharedChallengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
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
    it('returns newly created answer', async function () {
      // given
      const assessment = databaseBuilder.factory.buildAssessment({ state: Assessment.states.STARTED });
      const activity = databaseBuilder.factory.buildActivity({ assessmentId: assessment.id });
      await databaseBuilder.commit();

      const challenge = learningContentBuilder.buildChallenge();
      const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });
      const activityAnswer = domainBuilder.buildActivityAnswer({
        id: null,
        challengeId: challenge.id,
      });

      const learningContent = {
        challenges: [challenge],
        skills: [skill],
      };

      mockLearningContent(learningContent);

      // when
      const record = await correctAnswer({
        activityAnswer,
        assessmentId: assessment.id,
        sharedChallengeRepository,
        assessmentRepository,
        activityAnswerRepository,
        activityRepository,
      });

      const savedAnswer = await knex('activity-answers').where({ id: record.id }).first();

      // then
      expect(savedAnswer.challengeId).to.equal(challenge.id);
      expect(savedAnswer.activityId).to.equal(activity.id);
    });

    it(' should return error when challengeId doesnt match assessment lastChallengeId', async function () {
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
        sharedChallengeRepository,
        activityRepository,
        assessmentRepository,
      });

      expect(error).to.be.instanceOf(ChallengeNotAskedError);
      expect(error.message).to.equal('La question à laquelle vous essayez de répondre ne vous a pas été proposée.');
    });

    it(' should return error when assessment is finished', async function () {
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
        sharedChallengeRepository,
        activityRepository,
        assessmentRepository,
      });

      expect(error).to.be.instanceOf(NotInProgressAssessmentError);
      expect(error.message).to.equal(`Mission assessment closed for ${assessment.id}`);
    });
  });

  context('when there is no assessmentId', function () {
    it('throws NotFoundError', async function () {
      // given
      const challenge = learningContentBuilder.buildChallenge();
      const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });
      const learningContent = {
        challenges: [challenge],
        skills: [skill],
      };
      mockLearningContent(learningContent);

      const assessmentId = null;
      const activityAnswer = domainBuilder.buildActivityAnswer({
        id: null,
        challengeId: challenge.id,
      });

      // when
      const error = await catchErr(correctAnswer)({
        activityAnswer,
        assessmentId,
        sharedChallengeRepository,
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
