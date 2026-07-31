import { expect } from 'chai';

import { knex } from '../../../../../db/knex-database-connection.js';
import {
  deleteAnswersByIds,
  selectAnswersByIds,
  selectAnswersIdsByAssementIds,
} from '../../../../../src/db-history/infrastructure/repositories/answers-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | History-db | Infrastructure | Repository | Answers', function () {
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
  describe('selectAnswersIdsByAssementIds', function () {
    it('select answers from assessment ids', async function () {
      // given
      databaseBuilder.factory.buildAssessment({ id: 100000 });
      databaseBuilder.factory.buildAssessment({ id: 100001 });
      databaseBuilder.factory.buildAssessment({ id: 100002 });

      databaseBuilder.factory.buildAnswer({
        id: 1,
        assessmentId: 100000,
      });

      databaseBuilder.factory.buildAnswer({
        id: 2,
        assessmentId: 100000,
      });

      databaseBuilder.factory.buildAnswer({
        id: 3,
        assessmentId: 100001,
      });
      databaseBuilder.factory.buildAnswer({
        id: 4,
        assessmentId: 100002,
      });
      await databaseBuilder.commit();
      const assessmentIds = { ids: [100000, 100002] };

      // when
      const answerIds = await selectAnswersIdsByAssementIds(assessmentIds);

      //then
      expect(answerIds).to.have.length(3);
      expect(answerIds.map((answer) => answer.id)).to.deep.equal([1, 2, 4]);
    });
  });

  describe('selectAnswersByIds', function () {
    it('select answers from  ids', async function () {
      // given
      databaseBuilder.factory.buildAnswer({
        id: 1,
      });

      databaseBuilder.factory.buildAnswer({
        id: 2,
      });

      databaseBuilder.factory.buildAnswer({
        id: 3,
      });
      databaseBuilder.factory.buildAnswer({
        id: 4,
      });
      await databaseBuilder.commit();

      // when
      const answerIds = await selectAnswersByIds({ ids: [1, 2, 4] });

      //then
      expect(answerIds).to.have.length(3);
      expect(answerIds.map((answer) => answer.id)).to.deep.equal([1, 2, 4]);
    });
  });
});
