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

  describe('#findAllByUserId', () => {

    context('with one campaign participation of type `ASSESSMENT`', () => {

      beforeEach(async () => {

        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findAllByUserId(userId);
        const [campaignParticipationOverview1] = campaignParticipationOverviews;

        expect(campaignParticipationOverview1).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverview1.createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverview1.assessmentState).to.equal('completed');
        expect(campaignParticipationOverview1.campaignTitle).to.equal('1 - My campaign');
        expect(campaignParticipationOverview1.organizationName).to.equal('1 - My organization');
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('with many campaign participations of type `ASSESSMENT`', () => {
      beforeEach(async () => {
        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        _createCampaignParticipationsWithAssessments({
          index: '2',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-02T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve all the campaign participations ordered by the newest createdAt', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findAllByUserId(userId);

        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign', '1 - My campaign']);

        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-02T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('completed');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('2 - My organization');

        expect(campaignParticipationOverviews[1]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[1].createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverviews[1].assessmentState).to.equal('started');
        expect(campaignParticipationOverviews[1].organizationName).to.equal('1 - My organization');
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
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findAllByUserId(userId);

        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });
  });

  describe('#findOngoingByUserId', () => {

    context('with one campaign participation of type `ASSESSMENT`', () => {

      beforeEach(async () => {

        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findOngoingByUserId(userId);
        const [campaignParticipationOverview1] = campaignParticipationOverviews;

        expect(campaignParticipationOverview1).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverview1.createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverview1.assessmentState).to.equal('started');
        expect(campaignParticipationOverview1.campaignTitle).to.equal('1 - My campaign');
        expect(campaignParticipationOverview1.organizationName).to.equal('1 - My organization');
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('with many campaign participations of type `ASSESSMENT`', () => {
      beforeEach(async () => {
        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        _createCampaignParticipationsWithAssessments({
          index: '2',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-02T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is started', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findOngoingByUserId(userId);

        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['1 - My campaign']);

        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('started');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('1 - My organization');
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
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findOngoingByUserId(userId);

        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });
  });

  describe('#findToShareByUserId', () => {

    context('with one campaign participation of type `ASSESSMENT`', () => {

      beforeEach(async () => {

        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findToShareByUserId(userId);
        const [campaignParticipationOverview1] = campaignParticipationOverviews;

        expect(campaignParticipationOverview1).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverview1.createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverview1.assessmentState).to.equal('completed');
        expect(campaignParticipationOverview1.campaignTitle).to.equal('1 - My campaign');
        expect(campaignParticipationOverview1.organizationName).to.equal('1 - My organization');
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('with many campaign participations of type `ASSESSMENT`', () => {
      beforeEach(async () => {
        _createCampaignParticipationsWithAssessments({
          index: '1',
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2000-07-01T10:00:00Z'),
        });

        _createCampaignParticipationsWithAssessments({
          index: '2',
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2000-07-02T10:00:00Z'),
        });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user with filtered assessment where state is completed', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findToShareByUserId(userId);

        expect(_.map(campaignParticipationOverviews, 'campaignTitle')).to.deep.equal(['2 - My campaign']);

        expect(campaignParticipationOverviews[0]).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverviews[0].createdAt).to.deep.equal(new Date('2000-07-02T10:00:00Z'));
        expect(campaignParticipationOverviews[0].assessmentState).to.equal('completed');
        expect(campaignParticipationOverviews[0].organizationName).to.equal('2 - My organization');
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
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findOngoingByUserId(userId);

        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });
  });

});

function _createCampaignParticipationsWithAssessments({ index, isShared, campaignParticipationCreatedAt, lastAssessmentState }) {
  const organizationId = databaseBuilder.factory.buildOrganization({ name: `${index} - My organization` }).id;
  const campaignId = databaseBuilder.factory.buildCampaign({
    organizationId,
    title: `${index} - My campaign`,
    createdAt: new Date('2000-01-01T10:00:00Z'),
    archivedAt: null,
  }).id;

  const expectedCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId,
    createdAt: campaignParticipationCreatedAt,
    campaignId,
    isShared,
  }).id;

  databaseBuilder.factory.buildAssessment({
    userId,
    campaignParticipationId: expectedCampaignParticipationId,
    state: Assessment.states.COMPLETED,
    createdAt: new Date('2000-07-01T10:00:00Z'),
  });

  databaseBuilder.factory.buildAssessment({
    userId,
    campaignParticipationId: expectedCampaignParticipationId,
    state: lastAssessmentState,
    createdAt: new Date('2000-07-02T10:00:00Z'),
  });
}
