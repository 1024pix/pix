import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../test-helper.js';
import { correctAnswer } from '../../../../lib/domain/usecases/correct-answer.js';
import * as activityAnswerRepository from '../../../../lib/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../lib/infrastructure/repositories/activity-repository.js';

describe('Integration | UseCases | correct-answer', function () {
  context('when there is assessmentId', function () {
    it('returns newly created answer', async function () {
      // given
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
      const activity = databaseBuilder.factory.buildActivity({ assessmentId });
      await databaseBuilder.commit();

      const challenge = domainBuilder.buildChallenge();
      const challengeRepository = { get: sinon.stub().resolves(challenge) };

      const activityAnswer = domainBuilder.buildActivityAnswer({
        id: null,
        challengeId: challenge.id,
      });

      // when
      const record = await correctAnswer({
        activityAnswer,
        assessmentId,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      const savedAnswer = await knex('activity-answers').where({ id: record.id }).first();

      // then
      expect(savedAnswer.challengeId).to.equal(challenge.id);
      expect(savedAnswer.activityId).to.equal(activity.id);
    });
  });
  context('when there is no assessmentId', function () {
    it('returns newly created answer with null as activtyId', async function () {
      // given
      const assessmentId = null;
      const challenge = domainBuilder.buildChallenge();
      const challengeRepository = { get: sinon.stub().resolves(challenge) };

      const activityAnswer = domainBuilder.buildActivityAnswer({
        id: null,
        challengeId: challenge.id,
      });

      // when
      const record = await correctAnswer({
        activityAnswer,
        assessmentId,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      const savedAnswer = await knex('activity-answers').where({ id: record.id }).first();

      // then
      expect(savedAnswer.challengeId).to.equal(challenge.id);
      expect(savedAnswer.activityId).to.equal(null);
    });
  });
});
