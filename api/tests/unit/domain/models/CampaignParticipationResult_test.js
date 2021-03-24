const { expect, domainBuilder } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const CompetenceResult = require('../../../../lib/domain/models/CompetenceResult');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | CampaignParticipationResult', function() {

  describe('#buildFrom', function() {

    const campaignParticipationId = 'campaignParticipationId';
    const userId = 'userId';
    const assessmentId = 'assessmentId';

    const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const knowledgeElements = [
      new KnowledgeElement({ skillId: 1, status: 'validated' }),
      new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
      new KnowledgeElement({ skillId: 7, status: 'validated' }),
    ];

    const jaffaArea = new Area({ name: 'area 1', color: 'jaffa' });
    const wildStrawberryArea = new Area({ name: 'area 2', color: 'wild-strawberry' });

    const competences = [
      { id: 1, name: 'Economie symbiotique', index: '5.1', skillIds: [1], area: jaffaArea },
      { id: 2, name: 'Désobéissance civile', index: '6.9', skillIds: [2, 3, 4], area: wildStrawberryArea },
      { id: 3, name: 'Démocratie liquide', index: '8.6', skillIds: [5, 6], area: wildStrawberryArea },
    ];

    const stages = [
      { title: 'palier 1', message: 'Tu as le palier 1', threshold: 0 },
      { title: 'palier 2', message: 'Tu as le palier 2', threshold: 20 },
      { title: 'palier 3', message: 'Tu as le palier 3', threshold: 40 },
      { title: 'palier 4', message: 'Tu as le palier 4', threshold: 60 },
      { title: 'palier 5', message: 'Tu as le palier 5', threshold: 80 },
    ];

    const targetProfile = domainBuilder.buildTargetProfile({
      id: 1,
      skills,
      stages: null,
    });

    const assessment = {
      id: assessmentId,
      userId,
      isCompleted() {
        return false;
      },
    };

    context('when no stage', function() {
      it('should add pix competences to the campaign participation results', function() {
        // when
        const campaignBadges = [];
        const acquiredBadgeIds = [];
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          campaignParticipationBadges: [],
          reachedStage: null,
          stageCount: null,
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

    });

    context('when stages', function() {
      beforeEach(function() {
        targetProfile.stages = stages;
      });
      afterEach(function() {
        targetProfile.stages = null;
      });

      it('when user has reached a stage', function() {
        // when
        const campaignBadges = [];
        const acquiredBadgeIds = [];

        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          campaignParticipationBadges: [],
          reachedStage: {
            title: 'palier 2',
            message: 'Tu as le palier 2',
            threshold: 20,
            starCount: 2,
          },
          stageCount: 5,
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });
    });

    context('when no badge', function() {

      it('should add pix competences to the campaign participation results', function() {
        // when
        const campaignBadges = [];
        const acquiredBadgeIds = [];
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.campaignParticipationBadges.length).to.equal(0);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          campaignParticipationBadges: [],
          reachedStage: null,
          stageCount: null,
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

    });

    context('when single badge', function() {

      it('should create campaign participation results', function() {
        // given
        const yellowBadge = domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Yellow badge',
          imageUrl: '/img/yellow.svg',
          message: 'Congrats, you won the Yellow badge!',
          title: 'Yellow',
          key: 'YELLOW',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 17,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [
            domainBuilder.buildBadgePartnerCompetence({
              id: 18,
              name: 'Yellow',
              color: 'emerald',
              skillIds: [1, 2, 4],
            }),
          ],
          targetProfileId: targetProfile.id,
        });
        const campaignBadges = [yellowBadge];
        const acquiredBadgeIds = [yellowBadge.id];

        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.campaignParticipationBadges.length).to.equal(1);
        expect(result.campaignParticipationBadges[0].partnerCompetenceResults[0]).to.be.an.instanceOf(CompetenceResult);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          campaignParticipationBadges: [{
            isAcquired: true,
            id: 1,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            title: 'Yellow',
            key: 'YELLOW',
            badgeCriteria: [{
              id: 17,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [{
              id: 18,
              name: 'Yellow',
              color: 'emerald',
              skillIds: [1, 2, 4],
            }],
            targetProfileId: targetProfile.id,
            partnerCompetenceResults: [{
              id: 18,
              areaColor: 'emerald',
              areaName: undefined,
              index: undefined,
              name: 'Yellow',
              testedSkillsCount: 2,
              totalSkillsCount: 3,
              validatedSkillsCount: 1,
            }],
          }],
          reachedStage: null,
          stageCount: null,
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

    });

    context('when multiple badges', function() {

      it('should create campaign participation results with partnerCompetenceResults from one badge', function() {
        // given
        const greenBadge = domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Green badge',
          imageUrl: '/img/green.svg',
          message: 'Congrats, you won the Green badge!',
          title: 'Green',
          key: 'GREEN',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [
            domainBuilder.buildBadgePartnerCompetence({
              id: 42,
              name: 'Green',
              color: 'jaffa',
              skillIds: [1, 2, 4],
            }),
          ],
          targetProfileId: targetProfile.id,
        });
        const yellowBadge = domainBuilder.buildBadge({
          id: 2,
          altMessage: 'You won the Yellow badge',
          imageUrl: '/img/yellow.svg',
          message: 'Congrats, you won the Yellow badge!',
          title: 'Yellow',
          key: 'YELLOW',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [],
          targetProfileId: targetProfile.id,
        });
        const campaignBadges = [greenBadge, yellowBadge];
        const acquiredBadgeIds = [greenBadge.id, yellowBadge.id];

        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.campaignParticipationBadges.length).to.equal(2);
        expect(result.campaignParticipationBadges[0].partnerCompetenceResults.length).to.equal(1);
        expect(result.campaignParticipationBadges[1].partnerCompetenceResults.length).to.equal(0);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          campaignParticipationBadges: [{
            id: 1,
            isAcquired: true,
            altMessage: 'You won the Green badge',
            imageUrl: '/img/green.svg',
            message: 'Congrats, you won the Green badge!',
            title: 'Green',
            key: 'GREEN',
            badgeCriteria: [{
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [{
              id: 42,
              name: 'Green',
              color: 'jaffa',
              skillIds: [1, 2, 4],
            }],
            partnerCompetenceResults: [{
              id: 42,
              name: 'Green',
              areaColor: 'jaffa',
              areaName: undefined,
              testedSkillsCount: 2,
              totalSkillsCount: 3,
              validatedSkillsCount: 1,
              index: undefined,
            }],
            targetProfileId: 1,
          }, {
            id: 2,
            isAcquired: true,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            title: 'Yellow',
            key: 'YELLOW',
            badgeCriteria: [{
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [],
            partnerCompetenceResults: [],
            targetProfileId: 1,
          }],
          reachedStage: null,
          stageCount: null,
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

      it('should create campaign participation results with partnerCompetenceResults from two badge', function() {
        // given
        const greenBadge = domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Green badge',
          imageUrl: '/img/green.svg',
          message: 'Congrats, you won the Green badge!',
          title: 'Green',
          key: 'GREEN',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [
            domainBuilder.buildBadgePartnerCompetence({
              id: 42,
              name: 'Green',
              color: 'jaffa',
              skillIds: [1, 2, 4],
            }),
          ],
          targetProfileId: targetProfile.id,
        });
        const yellowBadge = domainBuilder.buildBadge({
          id: 2,
          altMessage: 'You won the Yellow badge',
          imageUrl: '/img/yellow.svg',
          message: 'Congrats, you won the Yellow badge!',
          title: 'Yellow',
          key: 'YELLOW',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [
            domainBuilder.buildBadgePartnerCompetence({
              id: 48,
              name: 'Yellow',
              color: 'emerald',
              skillIds: [2],
            }),
          ],
          targetProfileId: targetProfile.id,
        });
        const campaignBadges = [greenBadge, yellowBadge];
        const acquiredBadgeIds = [greenBadge.id];

        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.campaignParticipationBadges.length).to.equal(2);
        expect(result.campaignParticipationBadges[0].partnerCompetenceResults.length).to.equal(1);
        expect(result.campaignParticipationBadges[1].partnerCompetenceResults.length).to.equal(1);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          reachedStage: null,
          stageCount: null,
          campaignParticipationBadges: [{
            id: 1,
            isAcquired: true,
            altMessage: 'You won the Green badge',
            imageUrl: '/img/green.svg',
            message: 'Congrats, you won the Green badge!',
            title: 'Green',
            key: 'GREEN',
            badgeCriteria: [{
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [{
              id: 42,
              name: 'Green',
              color: 'jaffa',
              skillIds: [1, 2, 4],
            }],
            partnerCompetenceResults: [{
              id: 42,
              index: undefined,
              name: 'Green',
              areaColor: 'jaffa',
              areaName: undefined,
              totalSkillsCount: 3,
              testedSkillsCount: 2,
              validatedSkillsCount: 1,
            }],
            targetProfileId: 1,
          }, {
            id: 2,
            isAcquired: false,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            title: 'Yellow',
            key: 'YELLOW',
            badgeCriteria: [
              domainBuilder.buildBadgeCriterion({
                id: 15,
                scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
                threshold: 54,
                partnerCompetenceIds: [],
              }),
            ],
            badgePartnerCompetences: [
              domainBuilder.buildBadgePartnerCompetence({
                id: 48,
                name: 'Yellow',
                color: 'emerald',
                skillIds: [2],
              }),
            ],
            partnerCompetenceResults: [{
              id: 48,
              index: undefined,
              name: 'Yellow',
              areaName: undefined,
              areaColor: 'emerald',
              totalSkillsCount: 1,
              testedSkillsCount: 1,
              validatedSkillsCount: 0,
            }],
            targetProfileId: targetProfile.id,
          }],
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

      it('should not add partnerCompetenceResults to the campaign participation results', function() {
        // given
        const greenBadge = domainBuilder.buildBadge({
          id: 1,
          altMessage: 'You won the Green badge',
          imageUrl: '/img/green.svg',
          message: 'Congrats, you won the Green badge!',
          title: 'Green',
          key: 'GREEN',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [],
          targetProfileId: targetProfile.id,
        });
        const yellowBadge = domainBuilder.buildBadge({
          id: 2,
          altMessage: 'You won the Yellow badge',
          imageUrl: '/img/yellow.svg',
          message: 'Congrats, you won the Yellow badge!',
          title: 'Yellow',
          key: 'YELLOW',
          badgeCriteria: [
            domainBuilder.buildBadgeCriterion({
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
            }),
          ],
          badgePartnerCompetences: [],
          targetProfileId: targetProfile.id,
        });
        const campaignBadges = [greenBadge, yellowBadge];
        const acquiredBadgeIds = [greenBadge.id, yellowBadge.id];

        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          targetProfile,
          knowledgeElements,
          campaignBadges,
          acquiredBadgeIds,
        });

        // then
        expect(result).to.be.an.instanceOf(CampaignParticipationResult);
        expect(result.campaignParticipationBadges.length).to.equal(2);
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          reachedStage: null,
          stageCount: null,
          campaignParticipationBadges: [{
            id: 1,
            isAcquired: true,
            altMessage: 'You won the Green badge',
            imageUrl: '/img/green.svg',
            message: 'Congrats, you won the Green badge!',
            title: 'Green',
            key: 'GREEN',
            badgeCriteria: [{
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [],
            partnerCompetenceResults: [],
            targetProfileId: 1,
          }, {
            id: 2,
            isAcquired: true,
            altMessage: 'You won the Yellow badge',
            imageUrl: '/img/yellow.svg',
            message: 'Congrats, you won the Yellow badge!',
            title: 'Yellow',
            key: 'YELLOW',
            badgeCriteria: [{
              id: 15,
              scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
              threshold: 54,
              partnerCompetenceIds: [],
            }],
            badgePartnerCompetences: [],
            partnerCompetenceResults: [],
            targetProfileId: 1,
          }],
          competenceResults: [{
            id: 1,
            name: 'Economie symbiotique',
            index: '5.1',
            areaColor: 'jaffa',
            areaName: 'area 1',
            totalSkillsCount: 1,
            testedSkillsCount: 1,
            validatedSkillsCount: 1,
          }, {
            id: 2,
            name: 'Désobéissance civile',
            index: '6.9',
            areaColor: 'wild-strawberry',
            areaName: 'area 2',
            totalSkillsCount: 3,
            testedSkillsCount: 1,
            validatedSkillsCount: 0,
          }],
        });
      });

    });
  });

  describe('#masteryPercentage', function() {
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

  describe('#progress', function() {
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
