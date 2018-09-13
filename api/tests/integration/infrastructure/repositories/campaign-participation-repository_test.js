const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const Campaign = require('../../../../lib/domain/models/Campaign');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#get', () => {

    let campaign1;
    let campaignParticipation1;

    beforeEach(async () => {
      campaign1 = databaseBuilder.factory.buildCampaign({});

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return a campaign participation object', () => {
      // when
      const promise = campaignParticipationRepository.get(campaignParticipation1.id);

      // then
      return promise.then((campaignParticipationFind) => {
        expect(campaignParticipationFind.id).to.equal(campaignParticipation1.id);
      });
    });
  });

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

    afterEach(async () => {
      await databaseBuilder.clean();
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

    it('should reject with a not found error if the participation is not found', () => {
      // given
      const notFoundAssessmentId = 1789;

      // when
      const promise = campaignParticipationRepository.findByAssessmentId(notFoundAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#updateCampaignParticipation', () => {

    let campaignParticipation;
    let clock;
    const frozenTime = new Date('1987-09-01:00:00.000+01:00');

    beforeEach(() => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
      });

      clock = sinon.useFakeTimers(frozenTime);

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      clock.restore();
      await databaseBuilder.clean();
    });

    it('should return the shared campaign-participation of the given assessmentId', () => {
      // when
      const promise = campaignParticipationRepository.updateCampaignParticipation(campaignParticipation);

      // then
      return promise.then((updatedCampaignParticipation) => {
        expect(updatedCampaignParticipation.isShared).to.be.true;
        expect(updatedCampaignParticipation.assessmentId).to.equal(campaignParticipation.assessmentId);
        expect(updatedCampaignParticipation.sharedAt).to.deep.equal(frozenTime);
      });
    });
  });
});
