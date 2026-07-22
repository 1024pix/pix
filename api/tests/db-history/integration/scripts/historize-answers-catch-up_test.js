import sinon from 'sinon';

import { knex } from '../../../../db/knex-database-connection.js';
import { HistorizeAnswersCatchUpScript } from '../../../../src/db-history/scripts/historize-answers-catch-up.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';

describe('Integration | Scripts | Prod | historize-answers-catch-up', function () {
  describe('dryRun is true', function () {
    it('should log the number of answers to be deleted but does not delete', async function () {
      //given
      const logger = {
        info: sinon.stub(),
        error: sinon.stub(),
      };

      const historizeAnswersCatchUpScript = new HistorizeAnswersCatchUpScript();
      const options = {
        dryRun: true,
        startDate: '2020-01-01',
        endDate: '2020-01-03',
      };

      const firstAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'DEMO',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: firstAssessment.id,
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: firstAssessment.id,
      });

      const secondAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-03'),
        state: 'completed',
        type: 'DEMO',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: secondAssessment.id,
      });

      await databaseBuilder.commit();

      //when
      await historizeAnswersCatchUpScript.handle({ options, logger });

      //then
      const answers = await knex('answers');

      const loggerCalls = logger.info.getCalls();
      const middleDate = new Date(options.startDate);
      middleDate.setDate(middleDate.getDate() + 1);

      expect(answers).to.have.length(3);
      expect(logger.info).to.have.callCount(5);
      expect(loggerCalls[0].args[0]).to.equal(
        `Executing answers historization between ${options.startDate} and ${options.endDate}`,
      );
      expect(loggerCalls[1].args[0]).to.equal(
        `dryRun mode: 0 answer(s) would be deleted for ${new Date(options.startDate)}`,
      );
      expect(loggerCalls[2].args[0]).to.equal(`dryRun mode: 2 answer(s) would be deleted for ${middleDate}`);
      expect(loggerCalls[3].args[0]).to.equal(
        `dryRun mode: 1 answer(s) would be deleted for ${new Date(options.endDate)}`,
      );
      expect(loggerCalls[4].args[0]).to.equal(`dryRun mode: 3 answer(s) would be deleted`);
    });
  });

  describe('dryRun is false', function () {
    it('saves answers to bucket and deleted them afterwards', async function () {
      //given
      const logger = {
        info: sinon.stub(),
        error: sinon.stub(),
      };

      const historizeAnswersCatchUpScript = new HistorizeAnswersCatchUpScript();
      const options = {
        dryRun: false,
        startDate: '2020-01-01',
        endDate: '2020-01-03',
      };

      const firstAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'DEMO',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: firstAssessment.id,
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: firstAssessment.id,
      });

      const secondAssessment = databaseBuilder.factory.buildAssessment({
        updatedAt: new Date('2020-01-03'),
        state: 'completed',
        type: 'DEMO',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: secondAssessment.id,
      });

      await databaseBuilder.commit();

      //when
      await historizeAnswersCatchUpScript.handle({ options, logger });

      //then
      const answers = await knex('answers');

      const loggerCalls = logger.info.getCalls();
      const middleDate = new Date(options.startDate);
      middleDate.setDate(middleDate.getDate() + 1);

      expect(answers).to.have.length(0);
      expect(logger.info).to.have.callCount(4);
      expect(loggerCalls[0].args[0]).to.equal(
        `Executing answers historization between ${options.startDate} and ${options.endDate}`,
      );
      expect(loggerCalls[1].args[0]).to.equal(`Executing answers historization for ${new Date(options.startDate)}`);
      expect(loggerCalls[2].args[0]).to.equal(`Executing answers historization for ${middleDate}`);
      expect(loggerCalls[3].args[0]).to.equal(`Executing answers historization for ${new Date(options.endDate)}`);
    });
  });
});
