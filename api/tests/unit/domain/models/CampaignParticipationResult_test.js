const { expect } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | CampaignParticipationResult', function () {
  describe('#buildFrom', function () {
    const campaignParticipationId = 'campaignParticipationId';
    const userId = 'userId';
    const assessmentId = 'assessmentId';

    const skillIds = [1, 2, 3, 4];
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

    const assessment = {
      id: assessmentId,
      userId,
      isCompleted() {
        return false;
      },
    };

    context('when no stage', function () {
      it('should add pix competences to the campaign participation results', function () {
        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          stages: [],
          skillIds,
          knowledgeElements,
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
          reachedStage: {
            starCount: 0,
          },
          stageCount: 0,
          competenceResults: [
            {
              id: 1,
              name: 'Economie symbiotique',
              index: '5.1',
              areaColor: 'jaffa',
              areaName: 'area 1',
              totalSkillsCount: 1,
              testedSkillsCount: 1,
              validatedSkillsCount: 1,
            },
            {
              id: 2,
              name: 'Désobéissance civile',
              index: '6.9',
              areaColor: 'wild-strawberry',
              areaName: 'area 2',
              totalSkillsCount: 3,
              testedSkillsCount: 1,
              validatedSkillsCount: 0,
            },
          ],
        });
      });
    });

    context('when stages', function () {
      const stages = [
        { title: 'palier 1', message: 'Tu as le palier 1', threshold: 0 },
        { title: 'palier 2', message: 'Tu as le palier 2', threshold: 20 },
        { title: 'palier 3', message: 'Tu as le palier 3', threshold: 40 },
        { title: 'palier 4', message: 'Tu as le palier 4', threshold: 60 },
        { title: 'palier 5', message: 'Tu as le palier 5', threshold: 80 },
      ];

      it('when user has reached a stage', function () {
        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          stages,
          skillIds,
          knowledgeElements,
        });

        // then
        expect(result).to.deep.equal({
          id: campaignParticipationId,
          isCompleted: false,
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 1,
          knowledgeElementsCount: 2,
          reachedStage: {
            title: 'palier 2',
            message: 'Tu as le palier 2',
            threshold: 20,
            starCount: 2,
          },
          stageCount: 5,
          competenceResults: [
            {
              id: 1,
              name: 'Economie symbiotique',
              index: '5.1',
              areaColor: 'jaffa',
              areaName: 'area 1',
              totalSkillsCount: 1,
              testedSkillsCount: 1,
              validatedSkillsCount: 1,
            },
            {
              id: 2,
              name: 'Désobéissance civile',
              index: '6.9',
              areaColor: 'wild-strawberry',
              areaName: 'area 2',
              totalSkillsCount: 3,
              testedSkillsCount: 1,
              validatedSkillsCount: 0,
            },
          ],
        });
      });
    });

    context('when no badge', function () {
      it('should add pix competences to the campaign participation results', function () {
        // when
        const result = CampaignParticipationResult.buildFrom({
          campaignParticipationId,
          assessment,
          competences,
          stages: [],
          skillIds,
          knowledgeElements,
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
          reachedStage: {
            starCount: 0,
          },
          stageCount: 0,
          competenceResults: [
            {
              id: 1,
              name: 'Economie symbiotique',
              index: '5.1',
              areaColor: 'jaffa',
              areaName: 'area 1',
              totalSkillsCount: 1,
              testedSkillsCount: 1,
              validatedSkillsCount: 1,
            },
            {
              id: 2,
              name: 'Désobéissance civile',
              index: '6.9',
              areaColor: 'wild-strawberry',
              areaName: 'area 2',
              totalSkillsCount: 3,
              testedSkillsCount: 1,
              validatedSkillsCount: 0,
            },
          ],
        });
      });
    });
  });

  describe('#masteryPercentage', function () {
    it('should return the correct masteryPercentage when totalSkillsCount is different than 0', function () {
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

    it('should return 0 when totalSkillsCount is equal to 0', function () {
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

  describe('#progress', function () {
    it('should return the percentage of progression for the campaign', function () {
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
