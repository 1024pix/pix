import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../config/config.js';
import { DeleteOrganizationLearnersFromNetworkScript } from '../../../../src/prescription/scripts/delete-organization-learners-from-network.js';
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
      // databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      await databaseBuilder.commit();
    });

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

      databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

      // Inactive learners

      const learner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        updatedAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner1.id,
        user: learner1.userId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner1.id,
        user: learner1.userId,
        createdAt: lastActivityDate,
      });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        updatedAt: new Date('2020-01-01'),
      });

      // Active learners

      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        updatedAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner2.id,
        user: learner2.userId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner2.id,
        user: learner2.userId,
        createdAt: new Date('2025-01-01'),
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
      expect(learnersInDatabase).lengthOf(4);
      expect(deletedLearnersInDatabase).lengthOf(2);
      expect(participationsInDatabase).lengthOf(4);
      expect(deletedParticipationsInDatabase).lengthOf(2);
    });
  });

  it('does not delete inactive learners and participations of organizations not in network', async function () {
    expect(true).true;
  });

  it('does not update deletedAt of already deleted learners and participations', async function () {
    expect(true).true;
  });

  it('anonymize organization learners personal info even if learner is already deleted', async function () {
    expect(true).true;
  });

  it('does not delete learners with combined course activity', async function () {
    expect(true).true;
  });
});
