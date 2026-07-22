import { expect } from 'chai';

import { knex } from '../../../../../db/knex-database-connection.js';
import {
  deleteAnswersByIds,
  getAnswersByAssessmentTypeAndDateAndState,
} from '../../../../../src/db-history/infrastructure/repositories/answers-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | History-db | Infrastructure | Repository | AnswersHistory', function () {
  describe('getAnswersByAssessmentTypeAndDateAndState', function () {
    it('should get two answers from the assessment for the given date', async function () {
      // given
      const assessmentWithAnswer = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'CAMPAIGN',
      });
      const answer1 = databaseBuilder.factory.buildAnswer({
        assessmentId: assessmentWithAnswer.id,
      });
      const answer2 = databaseBuilder.factory.buildAnswer({
        assessmentId: assessmentWithAnswer.id,
      });

      await databaseBuilder.commit();

      const targetTypes = ['PREVIEW', 'CAMPAIGN'];
      const targetDate = '2020-01-02';
      const targetState = 'completed';

      // when
      const answers = await getAnswersByAssessmentTypeAndDateAndState({ targetTypes, targetDate, targetState });

      // then
      expect(answers).to.have.length(2);
      expect(answers[0].id).to.equal(answer1.id);
      expect(answers[1].id).to.equal(answer2.id);
    });

    describe('when assessment’s type is not given target type', function () {
      it('should not return this assessment’s answers', async function () {
        // given
        const assessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-03'),
          state: 'completed',
          type: 'CERTIFICATION',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });

        await databaseBuilder.commit();

        const targetTypes = ['PREVIEW', 'CAMPAIGN'];
        const targetDate = '2020-01-03';
        const targetState = 'completed';

        // when
        const answers = await getAnswersByAssessmentTypeAndDateAndState({ targetTypes, targetDate, targetState });

        // then
        expect(answers).to.have.length(0);
      });
    });

    describe('when assessment’s state is not completed', function () {
      it('should not return this assessment’s answers', async function () {
        // given
        const assessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-03'),
          state: 'started',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });

        await databaseBuilder.commit();

        const targetTypes = ['PREVIEW', 'CAMPAIGN'];
        const targetDate = '2020-01-03';
        const targetState = 'completed';

        // when
        const answers = await getAnswersByAssessmentTypeAndDateAndState({ targetTypes, targetDate, targetState });

        // then
        expect(answers).to.have.length(0);
      });
    });

    describe('when assessment’s updatedAt is not target date', function () {
      it('should not return this assessment’s answers', async function () {
        // given
        const assessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-04'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });

        await databaseBuilder.commit();

        const targetTypes = ['PREVIEW', 'CAMPAIGN'];
        const targetDate = '2020-01-03';
        const targetState = 'completed';

        // when
        const answers = await getAnswersByAssessmentTypeAndDateAndState({ targetTypes, targetDate, targetState });

        // then
        expect(answers).to.have.length(0);
      });
    });
  });

  describe('deleteAnswersByIds', function () {
    it('only deletes answers with given ids', async function () {
      // given
      const answerToDelete1 = databaseBuilder.factory.buildAnswer({});
      const answerToDelete2 = databaseBuilder.factory.buildAnswer({});
      const answerToKeep1 = databaseBuilder.factory.buildAnswer({});
      const answerToKeep2 = databaseBuilder.factory.buildAnswer({});
      await databaseBuilder.commit();

      // when
      await deleteAnswersByIds({ ids: [answerToDelete1.id, answerToDelete2.id] });

      // then
      const remainingAnswers = await knex('answers');
      expect(remainingAnswers).to.have.length(2);
      expect(remainingAnswers[0].id).to.equal(answerToKeep1.id);
      expect(remainingAnswers[1].id).to.equal(answerToKeep2.id);
    });
  });
});
