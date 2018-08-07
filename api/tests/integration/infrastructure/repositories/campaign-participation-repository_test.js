const { expect, knex } = require('../../../test-helper');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#save', () => {

    afterEach(() => {
      return knex('campaign-participations').delete();
    });

    it('should save the given campaign participation', () => {
      // given
      const campaignId =23;
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId: 12,
        campaign: new Campaign({ id : campaignId }),
      });

      // when
      const promise = campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      return promise.then((savedCampaignParticipations) => {
        expect(savedCampaignParticipations).to.be.instanceof(CampaignParticipation);
        expect(savedCampaignParticipations.id).to.exist;
        expect(savedCampaignParticipations.assessmentId).to.equal(campaignParticipationToSave.assessmentId);
      });
    });

  });

});
