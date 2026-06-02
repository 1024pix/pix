import { expect } from 'chai';
import sinon from 'sinon';

import { knex } from '../../../db/knex-database-connection.js';
import { GetAnswersFromAssessments } from '../../../scripts/prod/get-answers-from-assessments.js';
import { databaseBuilder } from '../../tooling/databases.js';

describe('GetAnswersFromAssessments', function () {
  describe('when running in dryRun mode', function () {
    it('does not delete selected answers', async function () {
      const logger = {
        info: sinon.stub(),
      };
      const todayDate = new Date();
      const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

      const validAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: oneYearAgo,
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({ assessmentId: validAssessment.id });

      const olderAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-01'),
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({
        assessmentId: olderAssessment.id,
      });

      const certificationAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: oneYearAgo,
        state: 'completed',
        type: 'CERTIFICATION',
      });
      databaseBuilder.factory.buildAnswer({
        assessmentId: certificationAssessment.id,
      });

      await databaseBuilder.commit();

      const script = new GetAnswersFromAssessments();
      await script.handle({
        logger,
        options: { dryRun: true },
      });

      const remainingAnswers = await knex('answers');
      expect(remainingAnswers.length).to.equal(3);
      expect(logger.info.calledOnce).true;
    });
  });

  describe('when not running in dryRun mode', function () {
    it('delete answers from a list of assessments', async function () {
      const logger = {
        info: sinon.stub(),
      };
      const todayDate = new Date();
      const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

      const validAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: oneYearAgo,
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({ assessmentId: validAssessment.id });

      const olderAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-01'),
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({
        assessmentId: olderAssessment.id,
      });

      const certificationAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: oneYearAgo,
        state: 'completed',
        type: 'CERTIFICATION',
      });
      databaseBuilder.factory.buildAnswer({
        assessmentId: certificationAssessment.id,
      });

      await databaseBuilder.commit();

      const script = new GetAnswersFromAssessments();
      await script.handle({
        logger,
        options: { dryRun: false },
      });

      const remainingAnswers = await knex('answers');
      expect(remainingAnswers.length).to.equal(2);
    });
  });
});
