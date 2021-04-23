const { expect, domainBuilder, sinon } = require('../../../test-helper');
const computeValidatedSkillsCount = require('../../../../lib/domain/events/compute-validated-skills-count');
const CampaignParticipationResultsShared = require('./../../../../lib/domain/events/CampaignParticipationResultsShared');

describe('Unit | Domain | Events | compute-validated-skills-count', function() {

  describe('eventTypes', () => {
    it('returns the CampaignParticipationResultsShared', () => {
      const eventTypes = computeValidatedSkillsCount.eventTypes;

      expect(eventTypes).to.deep.equal([CampaignParticipationResultsShared]);
    });
  });

  describe('.computeValidatedSkillsCount', () => {
    let knowledgeElementRepository;
    let campaignParticipationRepository;
    let targetProfileWithLearningContentRepository;

    beforeEach(() => {
      campaignParticipationRepository = { get: sinon.stub(), update: sinon.stub() };
      targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
      knowledgeElementRepository = { countValidatedTargetedByCompetencesForOneUser: sinon.stub() };
    });

    context('when the campaign is of type assessment', () => {
      it('computes the validated skills count', async () => {
        const targetProfile = domainBuilder.buildTargetProfile();
        const campaign = domainBuilder.buildCampaign.ofTypeAssessment();
        const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: 1, campaignId: 2, userId: 3, campaign });
        const event = new CampaignParticipationResultsShared({ campaignParticipationId: campaignParticipation.id });
        const validatedSkillsCountByCompetence = {
          'competence1': 2,
          'competence2': 3,
        };
        const validatedSkillsCount = 5;

        campaignParticipationRepository.get
          .withArgs(event.campaignParticipationId, { include: ['campaign'] })
          .resolves(campaignParticipation);

        targetProfileWithLearningContentRepository.getByCampaignId
          .withArgs({ campaignId: campaignParticipation.campaignId })
          .resolves(targetProfile);

        knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser
          .withArgs(campaignParticipation.userId, campaignParticipation.sharedAt, targetProfile)
          .resolves(validatedSkillsCountByCompetence);

        await computeValidatedSkillsCount({ event, campaignParticipationRepository, knowledgeElementRepository, targetProfileWithLearningContentRepository });

        expect(campaignParticipation.validatedSkillsCount).to.equals(validatedSkillsCount);
        expect(campaignParticipationRepository.update).to.have.been.calledWith(campaignParticipation);
      });
    });

    context('when the campaign is of type profile collection', () => {
      it('does not compute the validated skills count', async () => {
        const targetProfile = domainBuilder.buildTargetProfile();
        const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();
        const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: 1, campaignId: 2, userId: 3, campaign });
        const event = new CampaignParticipationResultsShared({ campaignParticipationId: campaignParticipation.id });

        campaignParticipationRepository.get.resolves(campaignParticipation);
        targetProfileWithLearningContentRepository.getByCampaignId.resolves(targetProfile);
        knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser.resolves({});

        await computeValidatedSkillsCount({ event, campaignParticipationRepository, knowledgeElementRepository, targetProfileWithLearningContentRepository });

        expect(campaignParticipationRepository.update).not.to.have.been.called;
      });
    });

  });

});

