import { expect } from 'chai';
import sinon from 'sinon';

import { FixArbitraryOrganizationLearnerUpdatedAtScript } from '../../../../src/prescription/scripts/fix-arbitrary-organization-learner-updated-at.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

const dateBeforeRange = '2021-02-23T12:00:00.000000+01:00';
const dateInRange = '2022-02-23T12:00:00.000000+01:00';
const dateAfterRange = '2024-02-23T12:00:00.000000+01:00';

describe('Script | Prod | Fix Arbitrary Organization Learner Updated At', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new FixArbitraryOrganizationLearnerUpdatedAtScript();
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });
      expect(options.batchSize).to.deep.include({
        type: 'number',
        describe: 'Size of the batch to process',
        default: 1000,
      });
      expect(options.throttleDelay).to.deep.include({
        type: 'number',
        describe: 'Delay between batches in milliseconds',
        default: 300,
      });
    });
  });

  describe('Handle', function () {
    let script, logger;

    beforeEach(async function () {
      script = new FixArbitraryOrganizationLearnerUpdatedAtScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      await databaseBuilder.commit();
    });

    context('when dryRun is false', function () {
      it('updates updatedAt value of learners with their first participation date', async function () {
        // given
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learner.id,
          createdAt: dateBeforeRange,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({
          logger,
          options: {
            batchSize: 10,
            throttleDelay: 0,
            dryRun: false,
          },
        });

        // then
        const learnersInDatabase = await knex('organization-learners');
        expect(learnersInDatabase[0].createdAt).deep.equal(new Date(dateBeforeRange));
        expect(learnersInDatabase[0].updatedAt).deep.equal(new Date(dateBeforeRange));
      });

      it('updates learners batch by batch with their own first participation date', async function () {
        // given
        const otherDateBeforeRange = '2020-02-23T12:00:00.000000+01:00';

        const learner1 = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learner1.id,
          createdAt: dateBeforeRange,
        });

        const learner2 = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learner2.id,
          createdAt: otherDateBeforeRange,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({
          logger,
          options: {
            batchSize: 1,
            throttleDelay: 0,
            dryRun: false,
          },
        });

        // then
        const [learner1InDatabase, learner2InDatabase] = await knex('organization-learners').orderBy('id');
        expect(learner1InDatabase.createdAt).deep.equal(new Date(dateBeforeRange));
        expect(learner1InDatabase.updatedAt).deep.equal(new Date(dateBeforeRange));
        expect(learner2InDatabase.createdAt).deep.equal(new Date(otherDateBeforeRange));
        expect(learner2InDatabase.updatedAt).deep.equal(new Date(otherDateBeforeRange));
        expect(logger.info).to.have.been.calledWith('Batch #1: 1 learners to update');
        expect(logger.info).to.have.been.calledWith('Batch #2: 1 learners to update');
      });
    });

    describe('when dryRun is true', function () {
      it('does not persist changes', async function () {
        // given
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learner.id,
          createdAt: dateBeforeRange,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({
          logger,
          options: {
            batchSize: 10,
            throttleDelay: 0,
            dryRun: true,
          },
        });

        // then
        const learnersInDatabase = await knex('organization-learners');
        expect(learnersInDatabase[0].updatedAt).deep.equal(new Date(dateInRange));
      });
    });
  });

  describe('#findOrganizationLearnersWithArbitraryUpdatedAt', function () {
    let script;

    beforeEach(async function () {
      script = new FixArbitraryOrganizationLearnerUpdatedAtScript();
    });

    context('when learners have been created before or after the defined range', function () {
      it('does not return learners', async function () {
        // when
        const result = await script.findOrganizationLearnersWithArbitraryUpdatedAt({
          idOffset: 0,
          batchSize: 10,
        });

        const learnerBeforeRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateBeforeRange,
          updatedAt: dateBeforeRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerBeforeRange.id,
          createdAt: dateBeforeRange,
        });

        const learnerAfterRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateAfterRange,
          updatedAt: dateAfterRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerAfterRange.id,
          createdAt: dateInRange,
        });
        await databaseBuilder.commit();

        // then
        expect(result).lengthOf(0);
      });
    });

    context('when learners have been created in the defined range', function () {
      it('returns learner ID and firstParticipationDate if participation anterior to their creation date', async function () {
        // given
        const learnerWithParticipationBeforeRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        const firstParticipation = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationBeforeRange.id,
          createdAt: dateBeforeRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationBeforeRange.id,
          createdAt: dateAfterRange,
        });

        const learnerInRangeWithParticipationAfterRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerInRangeWithParticipationAfterRange.id,
          createdAt: dateInRange,
        });
        await databaseBuilder.commit();

        // when
        const result = await script.findOrganizationLearnersWithArbitraryUpdatedAt({
          idOffset: 0,
          batchSize: 10,
        });

        // then
        expect(result).lengthOf(1);
        expect(result[0].organizationLearnerId).deep.equal(learnerWithParticipationBeforeRange.id);
        expect(result[0].firstParticipationDate).deep.equal(new Date(firstParticipation.createdAt));
      });

      it('does not return learners with participation within or ulterior to their creation date', async function () {
        // given
        const learnerWithParticipationWithinRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationWithinRange.id,
          createdAt: dateInRange,
        });

        const learnerWithParticipationAfterRange = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationAfterRange.id,
          createdAt: dateAfterRange,
        });
        await databaseBuilder.commit();

        // when
        const result = await script.findOrganizationLearnersWithArbitraryUpdatedAt({
          idOffset: 0,
          batchSize: 10,
        });

        // then
        expect(result).lengthOf(0);
      });

      it('returns learner ID and firstParticipationDate in batch', async function () {
        // given
        const learnerWithParticipationBeforeRange1 = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        const firstParticipationLearner1 = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationBeforeRange1.id,
          createdAt: dateBeforeRange,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationBeforeRange1.id,
          createdAt: dateAfterRange,
        });
        const learnerWithParticipationBeforeRange2 = databaseBuilder.factory.buildOrganizationLearner({
          lastName: 'not empty',
          createdAt: dateInRange,
          updatedAt: dateInRange,
        });
        const firstParticipationLearner2 = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: learnerWithParticipationBeforeRange2.id,
          createdAt: dateBeforeRange,
        });
        await databaseBuilder.commit();

        // when
        const result1 = await script.findOrganizationLearnersWithArbitraryUpdatedAt({
          idOffset: 0,
          batchSize: 1,
        });

        // then
        expect(result1).lengthOf(1);
        expect(result1[0].organizationLearnerId).deep.equal(learnerWithParticipationBeforeRange1.id);
        expect(result1[0].firstParticipationDate).deep.equal(new Date(firstParticipationLearner1.createdAt));

        // re-when
        const result2 = await script.findOrganizationLearnersWithArbitraryUpdatedAt({
          idOffset: learnerWithParticipationBeforeRange1.id,
          batchSize: 1,
        });

        // re-then
        expect(result2).lengthOf(1);
        expect(result2[0].organizationLearnerId).deep.equal(learnerWithParticipationBeforeRange2.id);
        expect(result2[0].firstParticipationDate).deep.equal(new Date(firstParticipationLearner2.createdAt));
      });
    });
  });
});
