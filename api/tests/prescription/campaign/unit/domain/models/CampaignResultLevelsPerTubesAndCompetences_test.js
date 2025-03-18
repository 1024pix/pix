import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CampaignResultLevelPerTubesAndCompetences', function () {
  describe('compute', function () {
    let learningContent, keData;

    beforeEach(function () {
      const learningContentData = {
        frameworks: [
          {
            id: 'frameworkId',
            name: 'frameworkName',
            areas: [
              {
                id: 'recArea1',
                frameworkId: 'frameworkId',
                competenceIds: ['recCompetence1'],
                competences: [
                  {
                    id: 'recCompetence1',
                    index: '1.1',
                    name: 'nom de la competence',
                    description: 'description de la competence',
                    areaId: 'recArea1',
                    origin: 'Pix',
                    tubes: [
                      {
                        id: 'recTube1',
                        practicalTitle: 'tube1',
                        practicalDescription: 'tube1 description',
                        competenceId: 'recCompetence1',
                        skills: [
                          {
                            id: 'recSkillWeb1',
                            name: '@web1',
                            status: 'actif',
                            difficulty: 1,
                          },
                          {
                            id: 'recSkillWeb2',
                            name: '@web2',
                            status: 'actif',
                            difficulty: 2,
                          },
                        ],
                      },
                      {
                        id: 'recTube2',
                        practicalTitle: 'tube2',
                        practicalDescription: 'tube2 description',
                        competenceId: 'recCompetence1',
                        skills: [
                          {
                            id: 'recSkillUrl1',
                            name: '@url1',
                            status: 'actif',
                            difficulty: 3,
                          },
                          {
                            id: 'recSkillUrl2',
                            name: '@url2',
                            status: 'actif',
                            difficulty: 4,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      learningContent = domainBuilder.buildLearningContent(learningContentData.frameworks);

      const user1ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillWeb1',
        userId: 1,
      });
      const user1ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: 'recSkillWeb2',
        userId: 1,
      });

      const user2ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillUrl1',
        userId: 2,
      });

      const user2ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillUrl2',
        userId: 2,
      });

      keData = {
        participationId1: new KnowledgeElementCollection([user1ke1, user1ke2]).latestUniqNonResetKnowledgeElements,
        participationId2: new KnowledgeElementCollection([user2ke1, user2ke2]).latestUniqNonResetKnowledgeElements,
      };
    });

    it('should compute the maximum reachable level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });
      expect(campaignResult.campaignMaxReachableLevel).equal(3);
    });

    it('should compute the mean reached level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });
      expect(campaignResult.campaignMeanReachedLevel).equal(1.25);
    });

    it('should get max level per tube', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });

      expect(campaignResult.campaignLevelsPerTube).deep.equal([
        {
          id: 'recTube1',
          competenceId: 'recCompetence1',
          practicalTitle: 'tube1',
          practicalDescription: 'tube1 description',
          maxLevel: 2,
          meanLevel: 0.5,
        },
        {
          id: 'recTube2',
          competenceId: 'recCompetence1',
          practicalTitle: 'tube2',
          practicalDescription: 'tube2 description',
          maxLevel: 4,
          meanLevel: 2,
        },
      ]);
    });

    it('should get max level per competence', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });

      expect(campaignResult.campaignLevelsPerCompetence).deep.equal([
        {
          id: 'recCompetence1',
          index: '1.1',
          name: 'nom de la competence',
          description: 'description de la competence',
          maxLevel: 3,
          meanLevel: 1.25,
        },
      ]);
    });
  });
});
