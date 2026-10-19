import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../config/config.js';
import { DeleteOrganizationLearnersFromNetworkScript } from '../../../../src/prescription/scripts/delete-organization-learners-from-network.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Script | Prod | Delete Organization Learners From Network', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteOrganizationLearnersFromNetworkScript();
      const { options } = script.metaInfo;

      expect(options.networkId).to.deep.include({
        type: 'number',
        describe: 'an id from a single network',
        demandOption: true,
      });

      expect(options.lastActivityDate).to.deep.include({
        type: 'string',
        describe: 'Delete learners which activity is older than this date',
        demandOption: true,
      });
    });
  });

  describe('Handle', function () {
    let script, logger;

    beforeEach(async function () {
      script = new DeleteOrganizationLearnersFromNetworkScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      await databaseBuilder.commit();
    });

    describe('when dryRun is false', function () {
      it('throws if lastActivityDate is invalid', async function () {
        const options = { networkId: 1, lastActivityDate: 'champignon' };
        const error = await catchErr(script.handle, script)({ options, logger });

        expect(error).ok;
        expect(error.message).equal('invalid lastActivityDate');
      });

      it('throws if network has no organization', async function () {
        const options = { networkId: 1, lastActivityDate: '2023-10-02' };
        const error = await catchErr(script.handle, script)({ options, logger });

        expect(error).ok;
        expect(error.message).to.equal('Network is empty');
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
        const options = { networkId: network.id, lastActivityDate };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(
          logger.info.calledWithExactly(
            `Delete learners from network ${options.networkId} with last activity prior to ${options.lastActivityDate}`,
          ),
        ).true;
        expect(logger.info.calledWithExactly(`Deleting 2 learners from organization ${organization.id}`)).true;
        expect(learnersInDatabase).lengthOf(4);
        expect(deletedLearnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase[0].id).to.equal(inactiveLearner1.id);
        expect(deletedLearnersInDatabase[0].firstName).to.equal('(anonymized)');
        expect(deletedLearnersInDatabase[0].lastName).to.equal('(anonymized)');
        expect(deletedLearnersInDatabase[0].birthdate).to.equal('1942-01-01');
        expect(deletedLearnersInDatabase[1].id).to.equal(inactiveLearner2.id);
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
        const options = { networkId: network1.id, lastActivityDate };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(learnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase).lengthOf(1);
        expect(deletedLearnersInDatabase[0].id).to.equal(inactiveLearnerNetwork1.id);
        expect(participationsInDatabase).lengthOf(2);
        expect(deletedParticipationsInDatabase).lengthOf(1);
        expect(deletedParticipationsInDatabase[0].id).to.equal(participationNetwork1.id);
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
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const options = { networkId: network.id, lastActivityDate };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');

        expect(learnersInDatabase).lengthOf(2);
        expect(deletedLearnersInDatabase).lengthOf(1);
        expect(deletedLearnersInDatabase[0].id).equal(inactiveLearnerWithoutCombinedCourseParticipation.id);
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
        const options = { networkId: network.id, lastActivityDate };
        await script.handle({ options, logger });

        // then
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(deletedLearnersInDatabase[0].id).to.equal(deletedLearnerWithDeletedParticipation.id);
        expect(new Date(deletedLearnersInDatabase[0].deletedAt)).to.deep.equal(
          new Date(deletedLearnerWithDeletedParticipation.deletedAt),
        );
        expect(deletedParticipationsInDatabase[0].id).to.equal(deletedParticipation.id);
        expect(new Date(deletedParticipationsInDatabase[0].deletedAt)).to.deep.equal(
          new Date(deletedParticipation.deletedAt),
        );

        expect(deletedLearnersInDatabase[1].id).to.equal(inactiveLearnerWithParticipation.id);
        expect(deletedParticipationsInDatabase[1].id).to.equal(inactiveParticipation.id);
      });
    });

    describe('when dryRun is true', function () {
      it('does not persist changes', async function () {
        // given
        const lastActivityDate = new Date('2021-01-01');

        const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

        const inactiveLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          updatedAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: inactiveLearner.id,
          user: inactiveLearner.userId,
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const options = { networkId: network.id, lastActivityDate, dryRun: true };
        await script.handle({ options, logger });

        // then
        const learnersInDatabase = await knex('organization-learners');
        const deletedLearnersInDatabase = await knex('organization-learners').whereNotNull('deletedAt');
        const participationsInDatabase = await knex('campaign-participations');
        const deletedParticipationsInDatabase = await knex('campaign-participations').whereNotNull('deletedAt');

        expect(
          logger.info.calledWithExactly(
            `Delete learners from network ${options.networkId} with last activity prior to ${options.lastActivityDate}`,
          ),
        ).true;
        expect(logger.info.calledWithExactly(`Deleting 1 learners from organization ${organization.id}`)).true;
        expect(learnersInDatabase).lengthOf(1);
        expect(deletedLearnersInDatabase).lengthOf(0);
        expect(participationsInDatabase).lengthOf(1);
        expect(deletedParticipationsInDatabase).lengthOf(0);
      });
    });
  });
});
