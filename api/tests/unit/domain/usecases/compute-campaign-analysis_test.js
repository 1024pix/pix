const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-analysis', () => {

  let campaignRepository;
  let competenceRepository;
  let targetProfileRepository;
  let tubeRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  let area;
  let competence;
  let tube;
  let targetProfile;
  let skill;

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    tubeRepository = { list: sinon.stub() };

    area = domainBuilder.buildArea();
    competence = domainBuilder.buildCompetence({ area });
    skill = domainBuilder.buildSkill({ id: 'skillId', competenceId: competence.id, tubeId: 'tubeId' });
    targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
    tube = domainBuilder.buildTube({ id: 'tubeId', competenceId: competence.id, skills: [skill] });
  });

  context('User has access to this result', () => {

    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(targetProfile);
    });

    it('should returns a single CampaignTubeRecommendation', async () => {
      // given
      competenceRepository.list.resolves([competence]);
      tubeRepository.list.resolves([tube]);
      const expectedCampaignTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
        campaignId,
        tubeId : tube.id,
        competenceId: competence.id,
        competenceName: competence.name,
        tubePracticalTitle: tube.practicalTitle,
        areaColor: area.color,
      });

      const expectedResult = {
        id: campaignId,
        campaignTubeRecommendations: [expectedCampaignTubeRecommendation],
      };

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        competenceRepository,
        targetProfileRepository,
        tubeRepository,
      });

      // then
      expect(actualCampaignAnalysis).to.deep.equal(expectedResult);
    });

    context('With several skills', () => {
      let skill2;
      let campaignTubeRecommendation;

      beforeEach(() => {
        skill2 = domainBuilder.buildSkill({ id: 'skillId2', competenceId: competence.id, tubeId: 'otherTubeId' });
        competenceRepository.list.resolves([competence]);

        campaignTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tubeId : tube.id,
          competenceId: competence.id,
          competenceName: competence.name,
          tubePracticalTitle: tube.practicalTitle,
          areaColor: area.color,
        });
      });

      it('should returns two CampaignTubeRecommendations', async () => {
        // given
        const largeTargetProfile = domainBuilder.buildTargetProfile({ skills: [skill, skill2] });
        targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(largeTargetProfile);

        const otherTube = domainBuilder.buildTube({ id: 'otherTubeId', competenceId: competence.id, skills: [skill2] });
        tubeRepository.list.resolves([tube, otherTube]);

        const campaignOtherTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tubeId : otherTube.id,
          competenceId: competence.id,
          competenceName: competence.name,
          tubePracticalTitle: otherTube.practicalTitle,
          areaColor: area.color,
        });

        const expectedResult = {
          id: campaignId,
          campaignTubeRecommendations: [campaignTubeRecommendation, campaignOtherTubeRecommendation],
        };

        // when
        const actualCampaignAnalysis = await computeCampaignAnalysis({
          userId,
          campaignId,
          campaignRepository,
          competenceRepository,
          targetProfileRepository,
          tubeRepository,
        });

        // then
        expect(actualCampaignAnalysis).to.deep.equal(expectedResult);
      });

      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async () => {
        // given
        const skill3 = domainBuilder.buildSkill({ id: 'skillId3', competenceId: competence.id, tubeId: 'otherTubeId' });

        const largeTargetProfile = domainBuilder.buildTargetProfile({ skills: [skill, skill2, skill3] });
        targetProfileRepository.getByCampaignId.withArgs(campaignId).resolves(largeTargetProfile);

        const otherTube = domainBuilder.buildTube({ id: 'otherTubeId', competenceId: competence.id, skills: [skill2, skill3] });
        tubeRepository.list.resolves([tube, otherTube]);

        const campaignOtherTubeRecommendation = domainBuilder.buildCampaignTubeRecommendation({
          campaignId,
          tubeId : otherTube.id,
          competenceId: competence.id,
          competenceName: competence.name,
          tubePracticalTitle: otherTube.practicalTitle,
          areaColor: area.color,
        });

        const expectedResult = {
          id: campaignId,
          campaignTubeRecommendations: [campaignTubeRecommendation, campaignOtherTubeRecommendation],
        };

        // when
        const actualCampaignAnalysis = await computeCampaignAnalysis({
          userId,
          campaignId,
          campaignRepository,
          competenceRepository,
          targetProfileRepository,
          tubeRepository,
        });

        // then
        expect(actualCampaignAnalysis).to.deep.equal(expectedResult);
      });
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
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
