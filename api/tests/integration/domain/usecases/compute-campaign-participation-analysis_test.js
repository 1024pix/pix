const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignParticipationAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | compute-campaign-participation-analysis', () => {

  let campaignRepository;
  let campaignParticipationRepository;
  let targetProfileWithLearningContentRepository;
  let knowledgeElementRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const campaignParticipationId = 'campaignParticipationId';
  let campaignParticipation;

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
    knowledgeElementRepository = { findValidatedTargetedGroupedByTubes: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };

    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, isShared: true });
  });

  context('User has access to this result', () => {
    context('Participant has shared its results', () => {
      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async () => {
        // given
        const tutorial = domainBuilder.buildTutorial({ id: 'recTuto1' });
        const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@url1', tubeId: 'recTube1', tutorialIds: [tutorial.id] });
        const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@url2', tubeId: 'recTube2' });
        const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence', practicalTitle: 'TubeName1', skills: [skill1Tube1] });
        const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence', practicalTitle: 'TubeName2', skills: [skill1Tube2] });
        const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence', areaId: 'recArea', tubes: [tube1, tube2] });
        const area = domainBuilder.buildTargetedArea({ id: 'recArea', competences: [competence], color: 'black' });
        const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
          skills: [skill1Tube1, skill1Tube2],
          tubes: [tube1, tube2],
          competences: [competence],
          areas: [area],
        });
        const knowledgeElementSkill1 = { skillId: 'recSkill11', userId: 1 };
        const knowledgeElementSkill2 = { skillId: 'recSkill21', userId: 1 };

        const campaignTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tube: tube1,
          competence,
          area,
          validatedKnowledgeElements: [knowledgeElementSkill1],
          maxSkillLevelInTargetProfile:  2,
          participantsCount: 1,
          tutorials: [tutorial],
        });

        const campaignOtherTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tube: tube2,
          competence,
          validatedKnowledgeElements: [knowledgeElementSkill2],
          area,
          maxSkillLevelInTargetProfile:  2,
          participantsCount: 1,
          tutorials: [],
        });

        targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId }).resolves(targetProfile);
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
        targetProfileWithLearningContentRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
        knowledgeElementRepository.findValidatedTargetedGroupedByTubes
          .withArgs({ [campaignParticipation.userId]: campaignParticipation.sharedAt }, targetProfile)
          .resolves({ 'recTube1': [knowledgeElementSkill1], 'recTube2': [knowledgeElementSkill2] });
        tutorialRepository.list.resolves([tutorial]);

        const expectedResult = {
          id: campaignId,
          campaignTubeRecommendations: [campaignTubeRecommendation, campaignOtherTubeRecommendation],
        };

        // when
        const actualCampaignAnalysis = await computeCampaignParticipationAnalysis({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignParticipationRepository,
          targetProfileWithLearningContentRepository,
          knowledgeElementRepository,
          tutorialRepository,
        });

        // then
        expect(actualCampaignAnalysis).to.deep.equal(expectedResult);
      });
    });

    context('Participant has not shared its results', () => {
      it('should returns null', async () => {
        // given
        campaignParticipation.isShared = false;
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);

        // when
        const actualCampaignAnalysis = await computeCampaignParticipationAnalysis({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignParticipationRepository,
          targetProfileWithLearningContentRepository,
          tutorialRepository,
        });

        // then
        expect(actualCampaignAnalysis).to.be.null;
      });
    });
  });

  context('User does not belong to the organization', () => {
    beforeEach(() => {
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignParticipationAnalysis)({
        userId,
        campaignParticipationId,
        campaignRepository,
        campaignParticipationRepository,
        targetProfileWithLearningContentRepository,
        tutorialRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
