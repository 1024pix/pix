const { expect, knex } = require('../../../test-helper');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#save', () => {

    afterEach(() => {
      return knex('campaign-participations').delete();
    });

    it('should return the given campaign participation', () => {
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
      return promise.then((campaignParticipationSaved) => {
        return knex.select('id', 'assessmentId', 'campaignId')
          .from('campaign-participations')
          .where({ id: campaignParticipationSaved.id })
          .then(([campaignParticipationInDb]) => {
            expect(campaignParticipationInDb.id).to.equal(campaignParticipationSaved.id);
            expect(campaignParticipationInDb.assessmentId).to.equal(campaignParticipationToSave.assessmentId);
            expect(campaignParticipationInDb.campaignId).to.equal(campaignParticipationToSave.campaign.id);
          });
      });
    });

  });

  describe('#findByCampaignId', () => {
    const campaignParticipationsInsertedInDb = [
      {
        id: 1,
        assessmentId: 1,
        campaignId: 1,
      },
      {
        id: 2,
        assessmentId: 2,
        campaignId: 1,
      },
      {
        id: 3,
        assessmentId: 3,
        campaignId: 2,
      },
    ];
    const campaignInsertedInDb = [
      {
        id: 1,
        name: 'Campaign1',
      },
      {
        id: 2,
        name: 'Campaign2',
      }
    ];

    beforeEach(() => {
      return knex('campaigns').insert(campaignInsertedInDb).then(() => {
        return knex('campaign-participations').insert(campaignParticipationsInsertedInDb);
      });
    });

    afterEach(() => {
      return knex('campaigns').delete().then(() => {
        return knex('campaign-participations').delete();
      });
    });

    it('should return the given campaign participation', () => {
      // given
      const campaignId = 1;

      // when
      const promise = campaignParticipationRepository.findByCampaignId(campaignId);

      // then
      return promise.then((campaignParticipationsFind) => {
        expect(campaignParticipationsFind.length).to.equal(2);

        expect(campaignParticipationsFind[0].assessmentId).to.equal(campaignParticipationsInsertedInDb[0].assessmentId);
        expect(campaignParticipationsFind[0].campaign.id).to.equal(campaignParticipationsInsertedInDb[0].campaignId);

        expect(campaignParticipationsFind[1].assessmentId).to.equal(campaignParticipationsInsertedInDb[1].assessmentId);
        expect(campaignParticipationsFind[1].campaign.id).to.equal(campaignParticipationsInsertedInDb[1].campaignId);
      });
    });
  });
});
