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

    context('when no badge', function() {

      it('should add pix competences to the campaign participation results', () => {
        // when
        const badges = [];
        const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badges });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.badges.length).to.equal(0);
        expect(result.partnerCompetenceResults.length).to.equal(0);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          areBadgeCriteriaFulfilled: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          badges: [],
          partnerCompetenceResults: [],
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

    context('when single badge', function() {

      it('should add badgePartnerCompetences to the campaign participation results', () => {
        // when
        const badges = [domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Banana badge',
          imageUrl: '/img/banana.svg',
          message: 'Congrats, you won the Banana badge!',
          key: 'BANANA',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
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
        })];
        const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badges });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.badges.length).to.equal(1);
        expect(result.badges[0]).to.be.an.instanceOf(Badge);
        expect(result.badges[0].badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
        expect(result.badges[0].badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
        expect(result.partnerCompetenceResults[0]).to.be.an.instanceOf(CompetenceResult);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          areBadgeCriteriaFulfilled: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          badges: [{
            id: 1,
            altMessage: 'You won the Banana badge',
            imageUrl: '/img/banana.svg',
            message: 'Congrats, you won the Banana badge!',
            key: 'BANANA',
            badgeCriteria: [
              {
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
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
          }],
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

      it('should not add badgePartnerCompetences to the campaign participation results', () => {
        // when
        const badges = [domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Banana badge',
          imageUrl: '/img/banana.svg',
          message: 'Congrats, you won the Banana badge!',
          key: 'BANANA',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54
            })
          ],
          badgePartnerCompetences: [],
          targetProfileId: targetProfile.id,
        })];
        const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badges });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.badges.length).to.equal(1);
        expect(result.badges[0]).to.be.an.instanceOf(Badge);
        expect(result.badges[0].badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
        expect(result.badges[0].badgePartnerCompetences.length).to.equal(0);
        expect(result.partnerCompetenceResults.length).to.equal(0);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          areBadgeCriteriaFulfilled: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          badges: [{
            id: 1,
            altMessage: 'You won the Banana badge',
            imageUrl: '/img/banana.svg',
            message: 'Congrats, you won the Banana badge!',
            key: 'BANANA',
            badgeCriteria: [
              {
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
              }
            ],
            badgePartnerCompetences: [],
            targetProfileId: 1,
          }],
          partnerCompetenceResults: [],
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

    context('when multiple badges', function() {

      context('when there is no badgePartnerCompetence', () => {
        it('should not add badgePartnerCompetences to the campaign participation results', () => {
          // given
          const greenBadge = domainBuilder.buildBadge({
            id: 1,
            altMessage: 'You won the Green badge',
            imageUrl: '/img/green.svg',
            message: 'Congrats, you won the Green badge!',
            key: 'GREEN',
            badgeCriteria: [
              domainBuilder.buildBadgeCriterion({
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54
              })
            ],
            badgePartnerCompetences: [],
            targetProfileId: targetProfile.id,
          });
          const yellowBadge = domainBuilder.buildBadge({
            id: 2,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            key: 'YELLOW',
            badgeCriteria: [
              domainBuilder.buildBadgeCriterion({
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54
              })
            ],
            badgePartnerCompetences: [],
            targetProfileId: targetProfile.id,
          });
          const badges = [greenBadge, yellowBadge];

          // when
          const result = CampaignParticipationResult.buildFrom({
            campaignParticipationId,
            assessment,
            competences,
            targetProfile,
            knowledgeElements,
            badges
          });

          // then
          expect(result).to.be.an.instanceOf(CampaignParticipationResult);
          expect(result.badges.length).to.equal(2);
          expect(result.partnerCompetenceResults.length).to.equal(0);
          expect(result).to.deep.equal({
            id: campaignParticipationId,
            isCompleted: false,
            areBadgeCriteriaFulfilled: false,
            totalSkillsCount: 4,
            testedSkillsCount: 2,
            validatedSkillsCount: 1,
            knowledgeElementsCount: 2,
            badges: [{
              id: 1,
              altMessage: 'You won the Green badge',
              imageUrl: '/img/green.svg',
              message: 'Congrats, you won the Green badge!',
              key: 'GREEN',
              badgeCriteria: [{
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
              }],
              badgePartnerCompetences: [],
              targetProfileId: 1,
            }, {
              id: 2,
              altMessage: 'You won the Yellow badge',
              imageUrl: '/img/yellow.svg',
              message: 'Congrats, you won the Yellow badge!',
              key: 'YELLOW',
              badgeCriteria: [{
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
              }],
              badgePartnerCompetences: [],
              targetProfileId: 1,
            }],
            partnerCompetenceResults: [],
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

      context('when there is one badgePartnerCompetence', () => {
        it('should not badgePartnerCompetences to the campaign participation results', () => {
          // given
          const pixEmploiBadge = domainBuilder.buildBadge({
            id: 1,
            altMessage: 'You won the Pix Emploi badge',
            imageUrl: '/img/green.svg',
            message: 'Congrats, you won the Pix Emploi badge!',
            key: 'GREEN',
            badgeCriteria: [
              domainBuilder.buildBadgeCriterion({
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54
              })
            ],
            badgePartnerCompetences: [
              domainBuilder.buildBadgePartnerCompetence({
                id: 42,
                name: 'Pix Emploi',
                color: 'jaffa',
                skillIds: [1, 2, 4]
              })
            ],
            targetProfileId: targetProfile.id,
          });
          const yellowBadge = domainBuilder.buildBadge({
            id: 2,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            key: 'YELLOW',
            badgeCriteria: [
              domainBuilder.buildBadgeCriterion({
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54
              })
            ],
            badgePartnerCompetences: [],
            targetProfileId: targetProfile.id,
          });
          const badges = [pixEmploiBadge, yellowBadge];

          // when
          const result = CampaignParticipationResult.buildFrom({
            campaignParticipationId,
            assessment,
            competences,
            targetProfile,
            knowledgeElements,
            badges
          });

          // then
          expect(result).to.be.an.instanceOf(CampaignParticipationResult);
          expect(result.badges.length).to.equal(2);
          expect(result.partnerCompetenceResults.length).to.equal(1);
          expect(result).to.deep.equal({
            id: campaignParticipationId,
            isCompleted: false,
            areBadgeCriteriaFulfilled: false,
            totalSkillsCount: 4,
            testedSkillsCount: 2,
            validatedSkillsCount: 1,
            knowledgeElementsCount: 2,
            badges: [{
              id: 1,
              altMessage: 'You won the Pix Emploi badge',
              imageUrl: '/img/green.svg',
              message: 'Congrats, you won the Pix Emploi badge!',
              key: 'GREEN',
              badgeCriteria: [{
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
              }],
              badgePartnerCompetences: [{
                id: 42,
                name: 'Pix Emploi',
                color: 'jaffa',
                skillIds: [1, 2, 4]
              }],
              targetProfileId: 1,
            }, {
              id: 2,
              altMessage: 'You won the Yellow badge',
              imageUrl: '/img/yellow.svg',
              message: 'Congrats, you won the Yellow badge!',
              key: 'YELLOW',
              badgeCriteria: [{
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
              }],
              badgePartnerCompetences: [],
              targetProfileId: 1,
            }],
            partnerCompetenceResults: [{
              id: 42,
              index: undefined,
              name: 'Pix Emploi',
              areaColor: 'jaffa',
              totalSkillsCount: 3,
              testedSkillsCount: 2,
              validatedSkillsCount: 1,
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
