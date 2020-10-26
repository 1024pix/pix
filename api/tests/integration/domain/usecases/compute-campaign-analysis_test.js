const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | compute-campaign-analysis', () => {

  let campaignRepository;
  let targetProfileWithLearningContentRepository;
  let knowledgeElementRepository;
  let campaignParticipationRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
    knowledgeElementRepository = { findValidatedTargetedGroupedByTubes: sinon.stub() };
    campaignParticipationRepository = { findSharedParticipationsWithUserIdsAndDates: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };
  });

  context('User has access to this result', () => {
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
      const userIdsAndDates = { 1: new Date('2020-01-01') };

      const campaignTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
        campaignId,
        area,
        competence,
        tube: tube1,
        validatedKnowledgeElements: [knowledgeElementSkill1],
        maxSkillLevelInTargetProfile: 2,
        participantsCount: 1,
        tutorials: [tutorial],
      });

      const campaignOtherTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
        campaignId,
        area,
        competence,
        tube: tube2,
        validatedKnowledgeElements: [knowledgeElementSkill2],
        maxSkillLevelInTargetProfile: 2,
        participantsCount: 1,
        tutorials: [],
      });

      targetProfileWithLearningContentRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
      campaignParticipationRepository.findSharedParticipationsWithUserIdsAndDates
        .withArgs(campaignId)
        .resolves(userIdsAndDates);
      knowledgeElementRepository.findValidatedTargetedGroupedByTubes
        .withArgs(userIdsAndDates, targetProfile)
        .resolves({ [tube1.id]: [knowledgeElementSkill1], [tube2.id]: [knowledgeElementSkill2] });
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId }).resolves(targetProfile);
      tutorialRepository.list.resolves([tutorial]);

      const expectedResult = {
        id: campaignId,
        campaignTubeRecommendations: [campaignTubeRecommendation, campaignOtherTubeRecommendation],
      };

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        targetProfileWithLearningContentRepository,
        knowledgeElementRepository,
        campaignParticipationRepository,
        tutorialRepository,
      });

      // then
      expect(actualCampaignAnalysis).to.deep.equal(expectedResult);
    });
  });

  context('User does not belong to the organization', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignAnalysis)({
        userId,
        campaignId,
        campaignRepository,
        targetProfileWithLearningContentRepository,
        knowledgeElementRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
