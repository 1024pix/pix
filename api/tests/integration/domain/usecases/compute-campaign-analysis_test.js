const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | compute-campaign-analysis', () => {

  let campaignRepository;
  let competenceRepository;
  let targetProfileRepository;
  let tubeRepository;
  let knowledgeElementRepository;
  let campaignParticipationRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    tubeRepository = { list: sinon.stub() };
    knowledgeElementRepository = { findByUserIdsAndDatesGroupedByUserIdWithSnapshotting: sinon.stub() };
    campaignParticipationRepository = { findSharedParticipationOfCampaign: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };
  });

  context('User has access to this result', () => {
    it('should returns two CampaignTubeRecommendations with computed average score', async () => {
      // given
      const area = domainBuilder.buildArea();
      const competence = domainBuilder.buildCompetence({ area });
      const knowledgeElementSkill1 = { skillId: 'skillId', userId: 1, isValidated: true };
      const knowledgeElementSkill2 = { skillId: 'skillId2', userId: 1, isValidated: true };
      const knowledgeElementSkill3 = { skillId: 'skillId3', userId: 1, isValidated: false };
      const tutorial = domainBuilder.buildTutorial({ id: 'recTuto1' });
      const skill = domainBuilder.buildSkill({ id: 'skillId', name: '@url1', competenceId: competence.id, tubeId: 'tubeId', tutorialIds: [tutorial.id] });
      const skill2 = domainBuilder.buildSkill({ id: 'skillId2', name: '@url2', competenceId: competence.id, tubeId: 'otherTubeId' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill, skill2] });
      const tube = domainBuilder.buildTube({ id: 'tubeId', competenceId: competence.id, skills: [skill] });
      const otherTube = domainBuilder.buildTube({ id: 'otherTubeId', competenceId: competence.id, skills: [skill2] });
      targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
      competenceRepository.list.resolves([competence]);
      knowledgeElementRepository.findByUserIdsAndDatesGroupedByUserIdWithSnapshotting
        .withArgs({ 1: 'someDate' })
        .resolves({ 1: [knowledgeElementSkill1,knowledgeElementSkill2, knowledgeElementSkill3] });
      campaignParticipationRepository.findSharedParticipationOfCampaign.resolves([{ userId: 1, sharedAt: 'someDate' }]);
      tubeRepository.list.resolves([tube, otherTube]);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
      tutorialRepository.list.resolves([tutorial]);

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        competenceRepository,
        targetProfileRepository,
        tubeRepository,
        knowledgeElementRepository,
        campaignParticipationRepository,
        tutorialRepository,
      });

      // then
      const campaignTubeRecommendations = actualCampaignAnalysis.campaignTubeRecommendations;
      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tubeId');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'otherTubeId');
      expect(tube1Recommendation.averageScore).to.deep.equal(85);
      expect(tube2Recommendation.averageScore).to.deep.equal(100);
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
        competenceRepository,
        targetProfileRepository,
        tubeRepository,
        knowledgeElementRepository
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
