const { expect, catchErr, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Integration | UseCase | find-paginated-campaign-assessment-participation-summaries', () => {

  context('when requesting user is not allowed to access campaign informations', () => {
    let campaign;
    let user;

    beforeEach(async () => {
      const skill = { id: 'Skill1', name:  '@Acquis1' };
      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill]);
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should throw a UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const error = await catchErr(useCases.findPaginatedCampaignAssessmentParticipationSummaries)({
        userId: user.id,
        campaignId: campaign.id,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      expect(error.message).to.equal('User does not belong to an organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign informations', () => {
    let campaign;
    let user;
    let participant;

    beforeEach(async () => {
      const skill = { id: 'Skill1', name:  '@Acquis1' };
      const organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId: organization.id }, [skill]);
      const participation = { participantExternalId: 'Ashitaka', campaignId: campaign.id };
      participant = { id: 123, firstName: 'Princess', lastName: 'Mononoke' };
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      databaseBuilder.factory.buildAssessmentFromParticipation(participation, participant);

      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([skill]).activate();
      await databaseBuilder.commit();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('returns the campaignAssessmentParticipationSummaries for the participants of the campaign', async () => {
      const { campaignAssessmentParticipationSummaries } = await useCases.findPaginatedCampaignAssessmentParticipationSummaries({
        userId: user.id,
        campaignId: campaign.id,
      });

      expect(campaignAssessmentParticipationSummaries[0].participantExternalId).to.equal('Ashitaka');
    });

    context('when target profile has badges', () => {
      let badge;

      beforeEach(async () => {
        badge = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge.id, userId: participant.id });
        await databaseBuilder.commit();
      });

      it('returns the campaignAssessmentParticipationSummaries for the participants with badges', async () => {
        const { campaignAssessmentParticipationSummaries } = await useCases.findPaginatedCampaignAssessmentParticipationSummaries({
          userId: user.id,
          campaignId: campaign.id,
        });
  
        expect(campaignAssessmentParticipationSummaries[0].badges.length).to.equal(1);
        expect(campaignAssessmentParticipationSummaries[0].badges[0]).to.includes(badge);
      });
    });
  });
});

