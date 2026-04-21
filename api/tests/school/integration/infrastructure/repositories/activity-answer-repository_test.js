import _ from 'lodash';

import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | activityAnswerRepository', function () {
  describe('#findLastByActivity', function () {
    context('when activity does not exists', function () {
      it('should return undefined', async function () {
        // given
        databaseBuilder.factory.buildActivity({ id: 123, level: Activity.levels.TUTORIAL });
        await databaseBuilder.commit();

        // when
        const lastAnswer = await activityAnswerRepository.findLastByActivity(456);

        // then
        expect(lastAnswer).to.be.undefined;
      });
    });

    context('when there is no answer for the activity', function () {
      it('should return undefined', async function () {
        // given
        // no answer activity
        databaseBuilder.factory.buildActivity({ id: 123 });

        // other activity with answer
        databaseBuilder.factory.buildActivity({ id: 345 });
        databaseBuilder.factory.buildActivityAnswer({ activityId: 345 });

        await databaseBuilder.commit();

        // when
        const lastAnswer = await activityAnswerRepository.findLastByActivity(123);

        // then
        expect(lastAnswer).to.be.undefined;
      });
    });

    context('when activity has some activity answers', function () {
      it('should return the activity answers ordered by creation date', async function () {
        // given
        databaseBuilder.factory.buildActivity({ id: 123 });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: 123,
          challengeId: 'challenge1',
          createdAt: new Date('2023-06-01T15:01:00Z'),
          result: 'ko',
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId: 123,
          challengeId: 'challenge2',
          createdAt: new Date('2023-06-01T15:00:00Z'),
          result: 'ok',
        });
        await databaseBuilder.commit();

        // when
        const lastAnswer = await activityAnswerRepository.findLastByActivity(123);

        // then
        expect(lastAnswer.result).to.deep.equal(AnswerStatus.KO);
      });
    });
  });

  describe('#save', function () {
    it('should save and return the activity answer', async function () {
      // given

      const { id: activityId } = databaseBuilder.factory.buildActivity();
      await databaseBuilder.commit();

      const answerToSave = domainBuilder.buildActivityAnswer({
        challengeId: 'recChallenge123',
        activityId,
        value: 'Fruits',
        result: AnswerStatus.OK,
        resultDetails: 'some details',
      });

      // when
      const savedAnswer = await activityAnswerRepository.save(answerToSave);

      // then
      const answerInDB = await knex('activity-answers').where('id', savedAnswer.id).first();
      expect(_.pick(savedAnswer, ['challengeId', 'activityId', 'value', 'resultDetails'])).to.deep.equal(
        _.pick(answerInDB, ['challengeId', 'activityId', 'value', 'resultDetails']),
      );
    });
  });
});
