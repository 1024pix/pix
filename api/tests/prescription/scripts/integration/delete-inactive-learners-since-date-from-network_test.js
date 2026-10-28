import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../config/config.js';
import { DeleteInactiveLearnersSinceDateFromNetworkScript } from '../../../../src/prescription/scripts/delete-inactive-learners-since-date-from-network.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

const DEFAULT_BATCH_SIZE = 1000;

describe('Script | Prod | Delete Inactive Learners Since Date From Network', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteInactiveLearnersSinceDateFromNetworkScript();
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });
      expect(options.networkId).to.deep.include({
        type: 'number',
        describe: 'an id from a single network',
        demandOption: true,
      });
      expect(options.lastActivityDate).to.deep.include({
        type: 'string',
        describe: 'Delete learners if last activity is older than this date',
        demandOption: true,
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
      script = new DeleteInactiveLearnersSinceDateFromNetworkScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      await databaseBuilder.commit();
    });

    describe('when dryRun is false', function () {
      it('throws if lastActivityDate is invalid', async function () {
        const options = {
          networkId: 1,
          lastActivityDate: 'champignon',
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        const error = await catchErr(script.handle, script)({ options, logger });

        expect(error).ok;
        expect(error.message).deep.equal('invalid lastActivityDate');
      });

      it('throws if network has no organization', async function () {
        const options = {
          networkId: 1,
          lastActivityDate: '2023-10-02',
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        const error = await catchErr(script.handle, script)({ options, logger });

        expect(error).ok;
        expect(error.message).to.deep.equal('Network is empty');
      });

      it('deletes only inactive learners of network organizations since lastActivityDate and their participations', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

        // Inactive learners

        const inactiveLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
          firstName: 'Jean-Mi',
          lastName: 'Handriquesse',
          birthdate: new Date('1942-11-27'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearner1.id,
          user: inactiveLearner1.userId,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearner1.id,
          user: inactiveLearner1.userId,
          createdAt: new Date('2020-12-31'),
        });

        const inactiveLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });

        // Active learners

        const activeLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: activeLearner1.id,
          user: activeLearner1.userId,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: activeLearner1.id,
          user: activeLearner1.userId,
          createdAt: lastActivityDate,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2025-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network.id,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(
          logger.info.calledWithExactly(
            `Delete inactive learners since ${options.lastActivityDate} from network ${options.networkId}`,
          ),
        ).true;
        expect(logger.info).to.be.calledWithExactly(`2 inactive learners deleted from organization ${organization.id}`);
        expect(learnersInDatabase).lengthOf(4);
        expect(deletedLearnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase[0].id).deep.equal(inactiveLearner1.id);
        expect(deletedLearnersInDatabase[0].firstName).to.deep.equal('(anonymized)');
        expect(deletedLearnersInDatabase[0].lastName).to.deep.equal('(anonymized)');
        expect(deletedLearnersInDatabase[0].birthdate).to.deep.equal('1942-01-01');
        expect(deletedLearnersInDatabase[1].id).deep.equal(inactiveLearner2.id);
        expect(participationsInDatabase).lengthOf(4);
        expect(deletedParticipationsInDatabase).lengthOf(2);
      });

      it('does not delete inactive learners and participations of organizations not in network', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network: network1, organization: organization1 } =
          await databaseBuilder.factory.buildNetworkAndHeadOrganization();
        const { organization: organization2 } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

        const inactiveLearnerNetwork1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization1.id,
          updatedAt: new Date('2020-01-01'),
        });
        const participationNetwork1 = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearnerNetwork1.id,
          user: inactiveLearnerNetwork1.userId,
          createdAt: new Date('2020-01-01'),
        });

        const inactiveLearnerNetwork2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization2.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearnerNetwork2.id,
          user: inactiveLearnerNetwork2.userId,
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network1.id,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(learnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase).lengthOf(1);
        expect(deletedLearnersInDatabase[0].id).to.deep.equal(inactiveLearnerNetwork1.id);
        expect(participationsInDatabase).lengthOf(2);
        expect(deletedParticipationsInDatabase).lengthOf(1);
        expect(deletedParticipationsInDatabase[0].id).to.deep.equal(participationNetwork1.id);
      });

      it('does not delete learners with combined course activity', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          organizationId: organization.id,
        });

        const inactiveLearnerWithoutCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });

        const learnerWithCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: learnerWithCombinedCourseParticipation.id,
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: learnerWithCombinedCourseParticipation.id,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network.id,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');

        expect(learnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase).lengthOf(1);
        expect(deletedLearnersInDatabase[0].id).deep.equal(inactiveLearnerWithoutCombinedCourseParticipation.id);
      });

      it('does not update deletedAt of already deleted learners and participations', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

        const deletedLearnerWithDeletedParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
          deletedAt: new Date('2022-01-01'),
        });
        const deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: deletedLearnerWithDeletedParticipation.id,
          user: deletedLearnerWithDeletedParticipation.userId,
          createdAt: new Date('2020-01-01'),
          deletedAt: new Date('2022-01-01'),
        });

        const inactiveLearnerWithParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        const inactiveParticipation = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearnerWithParticipation.id,
          user: inactiveLearnerWithParticipation.userId,
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network.id,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
        };
        await script.handle({ options, logger });

        // then
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(deletedLearnersInDatabase[0].id).to.deep.equal(deletedLearnerWithDeletedParticipation.id);
        expect(new Date(deletedLearnersInDatabase[0].deletedAt)).to.deep.equal(
          new Date(deletedLearnerWithDeletedParticipation.deletedAt),
        );
        expect(deletedParticipationsInDatabase[0].id).to.deep.equal(deletedParticipation.id);
        expect(new Date(deletedParticipationsInDatabase[0].deletedAt)).to.deep.equal(
          new Date(deletedParticipation.deletedAt),
        );

        expect(deletedLearnersInDatabase[1].id).to.deep.equal(inactiveLearnerWithParticipation.id);
        expect(deletedParticipationsInDatabase[1].id).to.deep.equal(inactiveParticipation.id);
      });

      it('deletes inactive learners of network in batch', async function () {
        // given
        const lastActivityDate = '2021-01-01';

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          organizationId: organization.id,
        });

        const inactiveLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
          firstName: 'Jean-Mi',
          lastName: 'Handriquesse',
          birthdate: new Date('1942-11-27'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearner1.id,
          user: inactiveLearner1.userId,
          createdAt: new Date('2020-01-01'),
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });

        const learnerWithCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: learnerWithCombinedCourseParticipation.id,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network.id,
          lastActivityDate,
          batchSize: 2,
          throttleDelay: 0,
        };
        await script.handle({ options, logger });

        // then
        const loggerCalls = logger.info.getCalls();
        expect(loggerCalls[1].args[0]).to.deep.equal(`Batch #1: 2 inactive learners to delete`);
        expect(loggerCalls[2].args[0]).to.deep.equal(`Batch #2: 1 inactive learners to delete`);
        expect(loggerCalls[3].args[0]).to.deep.equal(
          `3 inactive learners deleted from organization ${organization.id}`,
        );
      });
    });

    describe('when dryRun is true', function () {
      it('does not persist changes', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          organizationId: organization.id,
        });

        const inactiveLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearner.id,
          user: inactiveLearner.userId,
          createdAt: new Date('2020-01-01'),
        });

        const learnerWithCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: learnerWithCombinedCourseParticipation.id,
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: learnerWithCombinedCourseParticipation.id,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const options = {
          networkId: network.id,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
          throttleDelay: 0,
          dryRun: true,
        };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(logger.info).to.be.calledWithExactly(`ROLLBACK: no changes were persisted (dry run)`);
        expect(logger.info).to.be.calledWithExactly(
          `1 inactive learners to delete from organization ${organization.id}`,
        );
        expect(learnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase).lengthOf(0);
        expect(participationsInDatabase).lengthOf(1);
        expect(deletedParticipationsInDatabase).lengthOf(0);
      });
    });
  });

  describe('#findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate', function () {
    let script;

    beforeEach(async function () {
      script = new DeleteInactiveLearnersSinceDateFromNetworkScript();
    });

    context('when learners have old participations', function () {
      context('when learners are old (updatedAt prior to lastActivityDate)', function () {
        it('returns learner ids', async function () {
          // given
          const updatedAt = new Date('2020-01-01');
          const lastActivityDate = new Date('2021-01-01');

          const organizationId = databaseBuilder.factory.buildOrganization().id;

          const learnerWithOldParticipation = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: learnerWithOldParticipation.id,
            userId: learnerWithOldParticipation.userId,
            createdAt: new Date('2020-01-01'),
          });

          const learnerWithParticipationJustBeforeLastActivityDate = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: learnerWithParticipationJustBeforeLastActivityDate.id,
            userId: learnerWithParticipationJustBeforeLastActivityDate.userId,
            createdAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: learnerWithParticipationJustBeforeLastActivityDate.id,
            userId: learnerWithParticipationJustBeforeLastActivityDate.userId,
            createdAt: new Date('2020-12-31T23:59:59Z'),
          });

          await databaseBuilder.commit();

          // when
          const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
            organizationId,
            lastActivityDate,
            batchSize: DEFAULT_BATCH_SIZE,
          });

          // then
          expect(learners).lengthOf(2);
          expect(learners[0]).deep.equal(learnerWithOldParticipation.id);
          expect(learners[1]).deep.equal(learnerWithParticipationJustBeforeLastActivityDate.id);
        });
      });
      context('when learners are recent (updatedAt equal or later than lastActivityDate)', function () {
        it('returns no learners', async function () {
          // given
          const updatedAt = new Date('2026-01-01');
          const lastActivityDate = new Date('2021-01-01');

          const organizationId = databaseBuilder.factory.buildOrganization().id;

          const learnerWithOldParticipation = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: learnerWithOldParticipation.id,
            userId: learnerWithOldParticipation.userId,
            createdAt: new Date('2020-01-01'),
          });

          await databaseBuilder.commit();

          // when
          const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
            organizationId,
            lastActivityDate,
            batchSize: DEFAULT_BATCH_SIZE,
          });

          // then
          expect(learners).lengthOf(0);
        });
      });
    });

    context('when learners have recent participations', function () {
      it('returns no learners', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const oldLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: oldLearner.id,
          userId: oldLearner.userId,
          createdAt: new Date('2025-01-01'),
        });

        const recentLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2025-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: recentLearner.id,
          userId: recentLearner.userId,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: recentLearner.id,
          userId: recentLearner.userId,
          createdAt: new Date('2025-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
          organizationId,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
        });

        // then
        expect(learners).lengthOf(0);
      });
    });

    context('when learners have no participation', function () {
      context('when learners are old (updatedAt prior to lastActivityDate)', function () {
        it('returns learners', async function () {
          // given
          const lastActivityDate = new Date('2021-01-01');

          const organizationId = databaseBuilder.factory.buildOrganization().id;

          const oldLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt: new Date('2020-01-01'),
          });
          const oldLearner2 = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt: new Date('2020-12-31T23:59:59Z'),
          });

          await databaseBuilder.commit();

          // when
          const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
            organizationId,
            lastActivityDate,
            batchSize: DEFAULT_BATCH_SIZE,
          });

          // then
          expect(learners).lengthOf(2);
          expect(learners[0]).deep.equal(oldLearner.id);
          expect(learners[1]).deep.equal(oldLearner2.id);
        });
      });
      context('when learners are recent (updatedAt equal or later than lastActivityDate)', function () {
        it('returns no learners', async function () {
          // given
          const lastActivityDate = new Date('2021-01-01');

          const organizationId = databaseBuilder.factory.buildOrganization().id;

          databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt: lastActivityDate,
          });
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            updatedAt: new Date('2025-01-01'),
          });

          await databaseBuilder.commit();

          // when
          const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
            organizationId,
            lastActivityDate,
            batchSize: DEFAULT_BATCH_SIZE,
          });

          // then
          expect(learners).lengthOf(0);
        });
      });
    });

    context('when learners have a combined course participation', function () {
      it('does not return learners', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          organizationId: organizationId,
        });

        const inactiveLearnerWithCampaignParticipation = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationId,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearnerWithCampaignParticipation.id,
          user: inactiveLearnerWithCampaignParticipation.userId,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: inactiveLearnerWithCampaignParticipation.id,
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
        });

        const inactiveLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationId,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          combinedCourseId,
          organizationLearnerId: inactiveLearner.id,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const learners = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
          organizationId,
          lastActivityDate,
          batchSize: DEFAULT_BATCH_SIZE,
        });

        // then
        expect(learners).lengthOf(0);
      });
    });

    context('when using a batch argument', function () {
      it('returns a batch of learners', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const batchSize = 2;

        const inactiveLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-06-06'),
        });
        const inactiveLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-03-03'),
        });
        await databaseBuilder.commit();

        // when
        const learnersBatch = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
          organizationId,
          lastActivityDate,
          batchSize,
        });

        // then
        expect(learnersBatch).lengthOf(2);
        expect(learnersBatch[0]).to.deep.equal(inactiveLearner1.id);
        expect(learnersBatch[1]).to.deep.equal(inactiveLearner2.id);
      });

      it('returns a batch of learners with id starting at idOffset', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const batchSize = 2;

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-01-01'),
        });
        const inactiveLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-06-06'),
        });
        const inactiveLearner3 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          updatedAt: new Date('2020-06-06'),
        });
        await databaseBuilder.commit();

        // when
        const learnersBatch = await script.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
          organizationId,
          lastActivityDate,
          batchSize,
          idOffset: inactiveLearner2.id,
        });

        // then
        expect(learnersBatch).lengthOf(1);
        expect(learnersBatch[0]).to.deep.equal(inactiveLearner3.id);
      });
    });
  });
});
