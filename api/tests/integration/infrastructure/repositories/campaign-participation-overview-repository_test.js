const { expect, databaseBuilder, knex } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const campaignParticipationOverviewRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-overview-repository');
const _ = require('lodash');

let userId;

describe('Integration | Repository | Campaign Participation Overview', () => {

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(() => {
    knex('campaigns').delete();
    knex('organizations').delete();
    knex('users').delete();
    knex('campaign-participations').delete();
    return knex('assessments').delete();
  });

  describe('#findByUserIdWithFilters', () => {

    context('with one campaign participation of type `ASSESSMENT` completed but not shared', () => {

      beforeEach(async () => {

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve no campaign participation overviews for the user when state is ONGOING', async () => {
        const states = ['ONGOING'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;
        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });

      it('should retrieve one campaign participation overviews for the user when state is TO_SHARE', async () => {
        const states = ['TO_SHARE'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(1);
        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('completed');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('1 - My organization');
      });
    });

    context('with one campaign participation of type `ASSESSMENT` completed and shared', () => {

      beforeEach(async () => {

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '1',
          isShared: true,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve no campaign participation overviews for the user when state is ONGOING', async () => {
        const states = ['ONGOING'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;
        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });

      it('should retrieve no campaign participation overviews for the user when state is TO_SHARE', async () => {
        const states = ['TO_SHARE'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;
        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });

      it('should retrieve one campaign participation overviews for the user when state is ENDED', async () => {
        const states = ['ENDED'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;
        expect(campaignParticipationOverviews).to.have.lengthOf(1);

        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('completed');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('1 - My organization');
      });
    });

    context('with many campaign participations of type `ASSESSMENT`', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '2',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-02T10:00:00Z'),
        });

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '3',
          isShared: true,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-03T10:00:00Z'),
          campaignParticipationSharedAt: new Date('2000-07-03T10:00:00Z'),
        });

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: '4',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-04T10:00:00Z'),
          campaignArchivedAt: new Date('2000-07-05T11:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve all campaign participations of the user', async () => {
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(3);
        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign', '1 - My campaign', '3 - My campaign']);
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is TO_SHARE', async () => {
        const states = ['TO_SHARE'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign']);

        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-02T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('completed');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('2 - My organization');
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is ONGOING and TO_SHARE', async () => {
        const states = ['ONGOING', 'TO_SHARE'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(2);
        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign', '1 - My campaign']);
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is TO_SHARE and ENDED', async () => {
        const states = ['TO_SHARE', 'ENDED'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(2);
        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign', '3 - My campaign']);
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is  ENDED', async () => {
        const states = ['ENDED'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(1);
        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['3 - My campaign']);
      });
    });

    context('with one campaign participation of type `PROFILES_COLLECTION`', () => {
      beforeEach(async () => {
        const organizationId = databaseBuilder.factory.buildOrganization({ name: 'My organization' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          title: 'My campaign',
          createdAt: new Date('2000-01-01T10:00:00Z'),
          archivedAt: null,
          type: Campaign.types.PROFILES_COLLECTION,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          createdAt: new Date('2000-07-01T10:00:00Z'),
          campaignId,
        }).id;

        await databaseBuilder.commit();
      });

      it('should retrieve no campaign participation of the user', async () => {
        const states = ['ONGOING', 'TO_SHARE', 'ENDED'];
        const rawCampaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
        const { campaignParticipationOverviews } = rawCampaignParticipationOverviews;

        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });
  });

});
