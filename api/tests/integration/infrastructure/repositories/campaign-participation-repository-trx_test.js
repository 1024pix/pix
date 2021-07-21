const { expect, knex, databaseBuilder } = require('../../../test-helper');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const CampaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository-trx');

describe('Integration | Repository | Campaign Participation', function() {
  let campaignParticipationRepository;
  beforeEach(function() {
    campaignParticipationRepository = new CampaignParticipationRepository(knex);
  });

  describe('#save', function() {

    let campaignId, userId;
    beforeEach(async function() {
      await knex('campaign-participations').delete();
      userId = databaseBuilder.factory.buildUser({}).id;
      campaignId = databaseBuilder.factory.buildCampaign({}).id;

      await databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('campaign-participations').delete();
    });

    it('should save the given campaign participation', async function() {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        campaignId,
        userId,
        participantExternalId: '034516273645RET',
      });

      // when
      await campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      const campaignParticipationInDB = await knex
        .select('id', 'campaignId', 'participantExternalId', 'userId')
        .from('campaign-participations')
        .first();
      expect(campaignParticipationInDB.campaignId).to.equal(campaignParticipationToSave.campaignId);
      expect(campaignParticipationInDB.participantExternalId).to.equal(campaignParticipationToSave.participantExternalId);
      expect(campaignParticipationInDB.userId).to.equal(campaignParticipationToSave.userId);
    });
  });

  describe('markPreviousParticipationsAsImproved', function() {
    it('marks previous participations as improved', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ multipleSendings: true }).id;
      const oldCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: false }).id;
      await databaseBuilder.commit();

      await campaignParticipationRepository.markPreviousParticipationsAsImproved(campaignId, userId);

      const campaignParticipation = await knex('campaign-participations').where({ id: oldCampaignParticipationId }).first();

      expect(campaignParticipation.isImproved).to.equals(true);
    });
  });

  describe('hasAlreadyParticipated', function() {
    it('returns true', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.hasAlreadyParticipated(campaignId, userId);

      expect(result).to.equals(true);
    });

    it('returns false', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.hasAlreadyParticipated(campaignId, userId);

      expect(result).to.equals(false);
    });
  });
});
