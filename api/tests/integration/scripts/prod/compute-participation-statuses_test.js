const { expect, databaseBuilder, knex } = require('../../../test-helper');
const computeParticipantStatuses = require('../../../../scripts/prod/compute-participation-statuses');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('compute-participation-statuses script', function () {
  context('For profile collection campaign', function () {
    beforeEach(async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        participantExternalId: 'shared participation',
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        participantExternalId: 'to share participation',
        status: 'STARTED',
      });

      await databaseBuilder.commit();
    });

    it('computes "TO SHARE" participations status', async function () {
      await computeParticipantStatuses(false);

      const campaignParticipation = await knex('campaign-participations')
        .where({ participantExternalId: 'to share participation' })
        .first();
      expect(campaignParticipation.status).to.equals('TO_SHARE');
    });

    it('computes "SHARED" participations status', async function () {
      await computeParticipantStatuses(false);

      const campaignParticipation = await knex('campaign-participations')
        .where({ participantExternalId: 'shared participation' })
        .first();
      expect(campaignParticipation.status).to.equals('SHARED');
    });
  });

  context('For assessment campaign', function () {
    beforeEach(async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

      _buildParticipationWithAssessment({
        campaignId,
        participantExternalId: 'shared participation',
        isShared: true,
        assessmentState: 'completed',
      });

      _buildParticipationWithAssessment({
        campaignId,
        participantExternalId: 'to share participation',
        isShared: false,
        withMultipleAssessments: true,
      });

      _buildParticipationWithAssessment({
        campaignId,
        participantExternalId: 'started participation',
        isShared: false,
        assessmentState: 'started',
        withMultipleAssessments: true,
      });

      await databaseBuilder.commit();
    });

    it('computes "STARTED" participations status', async function () {
      await computeParticipantStatuses(false);

      const campaignParticipation = await knex('campaign-participations')
        .where({ participantExternalId: 'started participation' })
        .first();
      expect(campaignParticipation.status).to.equals('STARTED');
    });

    it('computes "TO_SHARE" participations status', async function () {
      await computeParticipantStatuses(false);

      const campaignParticipation = await knex('campaign-participations')
        .where({ participantExternalId: 'to share participation' })
        .first();
      expect(campaignParticipation.status).to.equals('TO_SHARE');
    });

    it('computes "SHARED" participations status', async function () {
      await computeParticipantStatuses(false);

      const campaignParticipation = await knex('campaign-participations')
        .where({ participantExternalId: 'shared participation' })
        .first();
      expect(campaignParticipation.status).to.equals('SHARED');
    });
  });

  context('For multiple campaign types', function () {
    it('computes participation statuses of each campaign', async function () {
      const { id: campaignId1 } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });
      const { id: campaignId2 } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

      _buildParticipationWithAssessment({
        campaignId: campaignId1,
        participantExternalId: 'shared participation',
        isShared: true,
        assessmentState: 'completed',
      });

      _buildParticipationWithAssessment({
        campaignId: campaignId2,
        participantExternalId: 'to share participation',
        isShared: false,
        withMultipleAssessments: true,
      });

      await databaseBuilder.commit();

      await computeParticipantStatuses(false);

      const campaignParticipation1 = await knex('campaign-participations')
        .where({ participantExternalId: 'shared participation' })
        .first();
      expect(campaignParticipation1.status).to.equals('SHARED');

      const campaignParticipation2 = await knex('campaign-participations')
        .where({ participantExternalId: 'to share participation' })
        .first();
      expect(campaignParticipation2.status).to.equals('TO_SHARE');
    });
  });
});

function _buildParticipationWithAssessment({
  campaignId,
  participantExternalId,
  isShared,
  assessmentState,
  withMultipleAssessments,
}) {
  const userId = databaseBuilder.factory.buildUser().id;

  const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    participantExternalId,
    status: isShared ? 'SHARED' : 'STARTED',
    sharedAt: isShared ? new Date('2020-01-02') : null,
  }).id;

  databaseBuilder.factory.buildAssessment({
    campaignParticipationId,
    userId,
    state: assessmentState,
    createdAt: new Date('2020-01-02'),
  });

  if (withMultipleAssessments) {
    databaseBuilder.factory.buildAssessment({
      campaignParticipationId,
      userId,
      state: 'aborted',
      createdAt: new Date('2020-01-01'),
    });

    databaseBuilder.factory.buildAssessment({
      campaignParticipationId,
      userId,
      state: 'completed',
      createdAt: new Date('2019-01-01'),
    });

    databaseBuilder.factory.buildAssessment({
      campaignParticipationId,
      userId,
      state: 'started',
      createdAt: new Date('2019-01-01'),
    });
  }
}
