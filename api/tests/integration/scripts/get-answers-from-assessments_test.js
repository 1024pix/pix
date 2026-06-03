import { expect } from 'chai';
import { parquetReadObjects } from 'hyparquet';
import sinon from 'sinon';

import { knex } from '../../../db/knex-database-connection.js';
import {
  GetAnswersFromAssessments,
  writeBufferFromAnswers,
} from '../../../scripts/prod/get-answers-from-assessments.js';
import { databaseBuilder } from '../../tooling/databases.js';

describe('GetAnswersFromAssessments', function () {
  describe('handle', function () {
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

    describe.only('when not running in dryRun mode', function () {
      it('delete answers from a list of assessments', async function () {
        const logger = {
          info: sinon.stub(),
        };
        const todayDate = new Date();
        const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

        const validAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date("2020-01-03"),
          state: "completed",
          type: "CAMPAIGN",
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
          options: { dryRun: false, outputFile: '/tmp/answers.parquet' },
        });

        const remainingAnswers = await knex('answers');
        expect(remainingAnswers.length).to.equal(2);
      });
    });
  });

  describe('writeBufferFromAnswers', function () {
    it('writes answers to a buffer', async function () {
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for first answer',
        result: 'result for first answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        timeout: null,
        resultDetails: 'result details for first answer.',
        isFocusedOut: false,
        timeSpent: 30,
      });

      const secondAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for second answer',
        result: 'result for second answer',
        challengeId: 'rec123DEF',
        createdAt: new Date('2020-01-03'),
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for second answer.',
        isFocusedOut: true,
        timeSpent: 50,
      });

      const answersToBeDeleted = [firstAnswer, secondAnswer];

      await databaseBuilder.commit();

      const buffer = writeBufferFromAnswers(answersToBeDeleted);

      const asyncBuffer = {
        byteLength: buffer.byteLength,
        slice: (start, end) => buffer.slice(start, end),
      };
      const rows = await parquetReadObjects({ file: asyncBuffer });

      const today = new Date().toISOString().slice(0, 10);
      expect(rows).to.have.length(2);
      expect(rows[0]).to.deep.equal({
        id: BigInt(firstAnswer.id),
        value: 'value for first answer',
        result: 'result for first answer',
        assessmentId,
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        timeout: null,
        resultDetails: 'result details for first answer.',
        timeSpent: 30,
        isFocusedOut: false,
        extractedAt: today,
      });
      expect(rows[1]).to.deep.equal({
        id: BigInt(secondAnswer.id),
        value: 'value for second answer',
        result: 'result for second answer',
        assessmentId,
        challengeId: 'rec123DEF',
        createdAt: new Date('2020-01-03'),
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for second answer.',
        timeSpent: 50,
        isFocusedOut: true,
        extractedAt: today,
      });
    });
  });
});
