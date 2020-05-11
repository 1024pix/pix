const { expect, domainBuilder } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const Badge = require('../../../../lib/domain/models/Badge');
const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const CompetenceResult = require('../../../../lib/domain/models/CompetenceResult');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | CampaignParticipationResult', () => {

  describe('#buildFrom', () => {

    const campaignParticipationId = 'campaignParticipationId';
    const userId = 'userId';
    const assessmentId = 'assessmentId';

    const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const knowledgeElements = [
      new KnowledgeElement({ skillId: 1, status: 'validated' }),
      new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
      new KnowledgeElement({ skillId: 7, status: 'validated' }),
    ];

    const jaffaArea = new Area({ color: 'jaffa' });
    const wildStrawberryArea = new Area({ color: 'wild-strawberry' });

    const competences = [
      { id: 1, name: 'Economie symbiotique', index: '5.1', skillIds: [1], area: jaffaArea },
      { id: 2, name: 'Désobéissance civile', index: '6.9', skillIds: [2, 3, 4], area: wildStrawberryArea },
      { id: 3, name: 'Démocratie liquide', index: '8.6', skillIds: [5, 6], area: wildStrawberryArea },
    ];

    const targetProfile = {
      id: 1,
      skills,
    };

    const assessment = {
      id: assessmentId,
      userId,
      isCompleted() {
        return false;
      },
    };

    it('should add the campaign participation results', () => {
      // when
      const badge = domainBuilder.buildBadge({
        id: 1,
        altMessage: 'You won the Banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won the Banana badge!',
        key: 'BANANA',
        badgeCriteria: [
          domainBuilder.buildBadgeCriterion({
            id: 15,
            scope: 'Every competences should be validated with X %',
            threshold: 54
          })
        ],
        badgePartnerCompetences: [
          domainBuilder.buildBadgePartnerCompetence({
            id: 12,
            name: 'Pix Emploi',
            color: 'emerald',
            skillIds: [1, 2, 4]
          })
        ],
        targetProfileId: targetProfile.id,
      });
      const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badge });

      // then
      expect(result).to.be.an.instanceOf(CampaignParticipationResult);
      expect(result.badge).to.be.an.instanceOf(Badge);
      expect(result.badge.badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
      expect(result.badge.badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
      expect(result.partnerCompetenceResults[0]).to.be.an.instanceOf(CompetenceResult);
      expect(result).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        areBadgeCriteriaFulfilled: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        knowledgeElementsCount: 2,
        badge: {
          id: 1,
          altMessage: 'You won the Banana badge',
          imageUrl: '/img/banana.svg',
          message: 'Congrats, you won the Banana badge!',
          key: 'BANANA',
          badgeCriteria: [
            {
              id: 15,
              scope: 'Every competences should be validated with X %',
              threshold: 54,
            }
          ],
          badgePartnerCompetences: [
            {
              color: 'emerald',
              id: 12,
              name: 'Pix Emploi',
              skillIds: [1, 2, 4],
            }
          ],
          targetProfileId: 1,
        },
        partnerCompetenceResults: [{
          id: 12,
          areaColor: 'emerald',
          index: undefined,
          name: 'Pix Emploi',
          testedSkillsCount: 2,
          totalSkillsCount: 3,
          validatedSkillsCount: 1
        }],
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          areaColor: 'jaffa',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          id: 2,
          name: 'Désobéissance civile',
          index: '6.9',
          areaColor: 'wild-strawberry',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });
  });

  describe('#masteryPercentage', () => {
    it('should return the correct masteryPercentage when totalSkillsCount is different than 0', function() {
      // given
      const expectedMasteryPercentage = 50;

      // when
      const campaignParticipationResult = new CampaignParticipationResult({
        totalSkillsCount: 10,
        testedSkillsCount: 6,
        validatedSkillsCount: 5,
      });

      // then
      expect(campaignParticipationResult.masteryPercentage).to.be.equal(expectedMasteryPercentage);
    });

    it('should return 0 when totalSkillsCount is equal to 0', function() {
      // given
      const expectedMasteryPercentage = 0;

      // when
      const campaignParticipationResult = new CampaignParticipationResult({
        totalSkillsCount: 0,
        testedSkillsCount: 6,
        validatedSkillsCount: 5,
      });

      // then
      expect(campaignParticipationResult.masteryPercentage).to.be.equal(expectedMasteryPercentage);
    });
  });

  describe('#progress', () => {
    it('should return the percentage of progression for the campaign', function() {
      // when
      const campaignParticipationResult = new CampaignParticipationResult({
        totalSkillsCount: 100,
        knowledgeElementsCount: 75,
      });

      // then
      expect(campaignParticipationResult.progress).to.equal(0.75);
    });
  });
});
