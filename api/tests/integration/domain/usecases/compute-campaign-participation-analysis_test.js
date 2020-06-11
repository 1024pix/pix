const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignParticipationAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | compute-campaign-participation-analysis', () => {

  let campaignRepository;
  let campaignParticipationRepository;
  let competenceRepository;
  let targetProfileRepository;
  let tubeRepository;
  let knowledgeElementRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const campaignParticipationId = 'campaignParticipationId';
  let campaignParticipation;

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    tubeRepository = { list: sinon.stub() };
    knowledgeElementRepository = { findByCampaignIdAndUserIdForSharedCampaignParticipation: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };

    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, isShared: true });
  });

  context('User has access to this result', () => {
    context('Participant has shared its results', () => {
      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async () => {
        // given
        const area = domainBuilder.buildArea();
        const competence = domainBuilder.buildCompetence({ area });
        const tutorial = domainBuilder.buildTutorial({ id: 'recTutorial1', duration: '00:01:30', format: 'video', link: 'https://youtube.fr', source: 'Youtube', title: 'Savoir regarder des vidéos youtube.' });
        const skill = domainBuilder.buildSkill({ id: 'skillId', name: '@url1', competenceId: competence.id, tubeId: 'tubeId', tutorialIds: [tutorial.id] });
        const skill2 = domainBuilder.buildSkill({ id: 'skillId2', name: '@url2', competenceId: competence.id, tubeId: 'otherTubeId' });
        const knowledgeElementSkill1 = { skillId: 'skillId', userId: 1 };
        const knowledgeElementSkill2 = { skillId: 'skillId2', userId: 1 };

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill, skill2] });
        const tube = domainBuilder.buildTube({ id: 'tubeId', competenceId: competence.id, skills: [skill] });
        const otherTube = domainBuilder.buildTube({ id: 'otherTubeId', competenceId: competence.id, skills: [skill2] });
        const campaignTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tube,
          competence,
          validatedKnowledgeElements: [knowledgeElementSkill1],
          skills: [skill],
          maxSkillLevelInTargetProfile:  2,
          participantsCount: 1,
          tutorials: [tutorial],
        });

        const campaignOtherTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tube: otherTube,
          competence,
          validatedKnowledgeElements: [knowledgeElementSkill2],
          skills: [skill2],
          maxSkillLevelInTargetProfile:  2,
          participantsCount: 1,
          tutorials: [],
        });

        targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
        competenceRepository.list.resolves([competence]);
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        tubeRepository.list.resolves([tube, otherTube]);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
        targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
        knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation.withArgs({ campaignId, userId: campaignParticipation.userId }).resolves([knowledgeElementSkill1,knowledgeElementSkill2]);
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
          competenceRepository,
          targetProfileRepository,
          tubeRepository,
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
          competenceRepository,
          targetProfileRepository,
          tubeRepository,
          tutorialRepository
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
        competenceRepository,
        targetProfileRepository,
        tubeRepository,
        tutorialRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
