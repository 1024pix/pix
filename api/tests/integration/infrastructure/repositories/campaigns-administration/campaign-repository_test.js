import { expect, knex, databaseBuilder, sinon } from '../../../../test-helper.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaigns-administration/campaign-repository.js';

describe('Integration | Infrastructure | Repository | Campaign Administration | campaign-repository', function () {
  let clock;
  const now = new Date('2023-02-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#archiveCampaigns', function () {
    it('Mark list of campaign to archived', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstCampaignId = databaseBuilder.factory.buildCampaign().id;
      const secondCampaignId = databaseBuilder.factory.buildCampaign().id;

      await databaseBuilder.commit();
      // when
      await campaignRepository.archiveCampaigns([firstCampaignId, secondCampaignId], userId);

      const firstResult = await knex('campaigns')
        .select('archivedAt', 'archivedBy')
        .where('id', firstCampaignId)
        .first();
      const secondResult = await knex('campaigns')
        .select('archivedAt', 'archivedBy')
        .where('id', secondCampaignId)
        .first();

      // then
      expect(firstResult.archivedBy).to.be.equal(userId);
      expect(firstResult.archivedAt).to.deep.equal(now);

      expect(secondResult.archivedBy).to.be.equal(userId);
      expect(secondResult.archivedAt).to.deep.equal(now);
    });

    it('Does not update archived campaign', async function () {
      // given
      const archivedAt = new Date('2021-05-06');
      const userWhichArchivedTheCampaign = databaseBuilder.factory.buildUser().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        archivedAt,
        archivedBy: userWhichArchivedTheCampaign,
      }).id;

      await databaseBuilder.commit();
      // when
      await campaignRepository.archiveCampaigns([campaignId], userId);

      const result = await knex('campaigns').select('archivedAt', 'archivedBy').where('id', campaignId).first();
      // then
      expect(result.archivedBy).to.be.equal(userWhichArchivedTheCampaign);
      expect(result.archivedAt).to.deep.equal(archivedAt);
    });

    it('Does not throw error if campaign does not exist', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const call = () => campaignRepository.archiveCampaigns([666], userId);

      // when
      expect(call).to.not.throw();
    });
  });

  describe('#createCampaigns', function () {
    afterEach(function () {
      return knex('campaigns').delete();
    });

    it('creates campaigns', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      await databaseBuilder.commit();

      const campaignsToCreate = [
        {
          targetProfileId,
          name: 'CampaignToCreate',
          organizationId,
          title: 'CampaignToCreate',
          customLandingPageText: 'CampaignToCreate',
          ownerId: userId,
          creatorId: userId,
          type: 'ASSESSMENT',
        },
      ];

      // when
      await campaignRepository.createCampaigns(campaignsToCreate);

      const createdCampaign = await knex('campaigns')
        .select(
          'targetProfileId',
          'name',
          'organizationId',
          'title',
          'customLandingPageText',
          'creatorId',
          'createdAt',
          'ownerId',
          'type',
        )
        .where('name', campaignsToCreate[0].name)
        .first();

      // then
      expect(createdCampaign).to.deep.equal({ ...campaignsToCreate[0], createdAt: now });
    });
  });
});
