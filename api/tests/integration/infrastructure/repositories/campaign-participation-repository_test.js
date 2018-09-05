const { expect, knex, databaseBuilder } = require('../../../test-helper');
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
      const campaignId = 23;
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId: 12,
        campaign: new Campaign({ id: campaignId }),
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
      const campaignId = 23;
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId: 12,
        campaign: new Campaign({ id: campaignId }),
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

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let campaignParticipation2;

    beforeEach(async () => {
      campaign1 = databaseBuilder.factory.buildCampaign({});
      campaign2 = databaseBuilder.factory.buildCampaign({});

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        isShared: true
      });
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        isShared: true
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        isShared: true
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return all the campaign-participation links to the given campaign', () => {
      // given
      const campaignId = campaign1.id;

      // when
      const promise = campaignParticipationRepository.findByCampaignId(campaignId);

      // then
      return promise.then((campaignParticipationsFind) => {
        expect(campaignParticipationsFind.length).to.equal(2);
        expect(campaignParticipationsFind[0].campaign.id).to.equal(campaignParticipation1.campaignId);
        expect(campaignParticipationsFind[1].campaign.id).to.equal(campaignParticipation2.campaignId);
      });
    });
  });

  describe('#findByAssessmentId', () => {

    let campaignParticipation;

    beforeEach(() => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();

      return databaseBuilder.commit();
    });

    afterEach(() => {
      databaseBuilder.clean();
    });

    it('should return the shared campaign-participation of the given assessmentId', () => {
      // given
      const expectedAssessmentId = campaignParticipation.assessmentId;

      // when
      const promise = campaignParticipationRepository.findByAssessmentId(expectedAssessmentId);

      // then
      return promise.then((foundCampaignParticipation) => {
        expect(foundCampaignParticipation.id).to.equal(campaignParticipation.id);
        expect(foundCampaignParticipation.assessmentId).to.equal(expectedAssessmentId);
        expect(foundCampaignParticipation.sharedAt).to.deep.equal(campaignParticipation.sharedAt);
        expect(foundCampaignParticipation.isShared).to.equal(campaignParticipation.isShared);
      });
    });
  });

  describe('#updateCampaignParticipation', () => {
    let campaignParticipation;

    beforeEach(() => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      databaseBuilder.clean();
    });

    it('should return the shared campaign-participation of the given assessmentId', () => {
      // given
      //const assessmentId = campaignParticipation.assessmentId;

      // when
      const promise = campaignParticipationRepository.updateCampaignParticipation(campaignParticipation);

      // then
      return promise.then((updatedCampaignParticipation) => {
        expect(updatedCampaignParticipation.isShared).to.be.true;
        expect(updatedCampaignParticipation.assessmentId).to.equal(campaignParticipation.assessmentId);
        expect(updatedCampaignParticipation.sharedAt).to.deep.equal(campaignParticipation.sharedAt);
      });
    });
  });
});
