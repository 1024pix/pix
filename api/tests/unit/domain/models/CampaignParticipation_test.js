const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignParticipation', () => {

  describe('#getTargetProfileId', () => {

    it('should return the targetProfileId from campaign associated', () => {
      // given
      const campaign = domainBuilder.buildCampaign();
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(campaign.targetProfileId);
    });

    it('should return null if has not campaign', () => {
      // given
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign: null,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(null);
    });

  });

  describe('#addCampaignParticipationResult', () => {
    const campaignParticipationId = 'campaignParticipationId';
    const userId = 'userId';
    const assessmentId = 'assessmentId';

    const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const knowledgeElements = [
      new SmartPlacementKnowledgeElement({ skillId: 1, status: 'validated' }),
      new SmartPlacementKnowledgeElement({ skillId: 2, status: 'invalidated' }),
      new SmartPlacementKnowledgeElement({ skillId: 7, status: 'validated' }),
    ];

    const competences = [
      { id: 1, name: 'Economie symbiotique', index: '5.1', skills: [1] },
      { id: 2, name: 'Désobéissance civile', index: '6.9', skills: [2, 3, 4] },
      { id: 3, name: 'Démocratie liquide', index: '8.6', skills: [5, 6] },
    ];

    const targetProfile = {
      skills,
    };

    const assessment = {
      id: assessmentId,
      userId,
      isCompleted() {
        return false;
      },
    };

    const campaignParticipation = new CampaignParticipation({
      id: campaignParticipationId,
    });

    it('should add the campaign participation results', () => {

      campaignParticipation.addCampaignParticipationResult({ assessment, competences, targetProfile, knowledgeElements });

      expect(campaignParticipation.campaignParticipationResult).to.be.an.instanceOf(CampaignParticipationResult);
      expect(campaignParticipation.campaignParticipationResult).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          id: 2,
          name: 'Désobéissance civile',
          index: '6.9',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });
  });
});
