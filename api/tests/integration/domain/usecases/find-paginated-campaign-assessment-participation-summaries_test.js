const { expect, catchErr, databaseBuilder, learningContentBuilder, mockLearningContent } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | find-paginated-campaign-assessment-participation-summaries', () => {

  context('when requesting user is not allowed to access campaign informations', () => {
    let campaign;
    let user;

    beforeEach(async () => {
      const skill = { id: 'Skill1', name: '@Acquis1' };
      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill]);
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should throw a UserNotAuthorizedToAccessEntityError error', async () => {
      // when
      const error = await catchErr(useCases.findPaginatedCampaignAssessmentParticipationSummaries)({
        userId: user.id,
        campaignId: campaign.id,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to an organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign informations', () => {
    let campaign;
    let user;
    let participant;

    beforeEach(async () => {
      const skill = { id: 'Skill1', name: '@Acquis1', challenges: [] };

      const learningContent = [{
        id: 'recArea1',
        titleFrFr: 'area1_Title',
        color: 'specialColor',
        competences: [{
          id: 'recCompetence1',
          name: 'Fabriquer un meuble',
          index: '1.1',
          tubes: [{
            id: 'recTube1',
            skills: [skill],
          }],
        }],
      }];
      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);

      const organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId: organization.id }, [skill]);
      const participation = { participantExternalId: 'Ashitaka', campaignId: campaign.id, validatedSkillsCount: 1 };
      participant = { id: 123, firstName: 'Princess', lastName: 'Mononoke' };
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      databaseBuilder.factory.buildAssessmentFromParticipation(participation, participant);

      await databaseBuilder.commit();
    });

    it('returns the campaignAssessmentParticipationSummaries for the participants of the campaign', async () => {
      const { campaignAssessmentParticipationSummaries } = await useCases.findPaginatedCampaignAssessmentParticipationSummaries({
        userId: user.id,
        campaignId: campaign.id,
        filters: {},
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
          filters: {},
        });

        expect(campaignAssessmentParticipationSummaries[0].badges.length).to.equal(1);
        expect(campaignAssessmentParticipationSummaries[0].badges[0]).to.includes(badge);
      });
    });

    context('when there is a filter on division', () => {
      beforeEach(async () => {
        const participation = { participantExternalId: 'Yubaba', campaignId: campaign.id };
        const participant = { id: 456, firstName: 'Chihiro', lastName: 'Ogino' };
        databaseBuilder.factory.buildAssessmentFromParticipation(participation, participant);
        databaseBuilder.factory.buildSchoolingRegistration({ userId: participant.id, organizationId: campaign.organizationId, division: '6eme' });

        await databaseBuilder.commit();
      });

      it('returns the campaignAssessmentParticipationSummaries for the participants for the division', async () => {
        const { campaignAssessmentParticipationSummaries } = await useCases.findPaginatedCampaignAssessmentParticipationSummaries({
          userId: user.id,
          campaignId: campaign.id,
          filters: { divisions: ['6eme'] },
        });

        expect(campaignAssessmentParticipationSummaries[0].participantExternalId).to.equal('Yubaba');
      });
    });

    context('when there is a filter on stages', () => {
      let stage;

      beforeEach(async () => {
        stage = databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 0 });
        await databaseBuilder.commit();
      });

      it('returns the campaignAssessmentParticipationSummaries for the participants with reached stage', async () => {
        const { campaignAssessmentParticipationSummaries } = await useCases.findPaginatedCampaignAssessmentParticipationSummaries({
          userId: user.id,
          campaignId: campaign.id,
          filters: { stages: [stage.id] },
        });

        expect(campaignAssessmentParticipationSummaries[0].participantExternalId).to.equal('Ashitaka');
      });
    });
  });
});

