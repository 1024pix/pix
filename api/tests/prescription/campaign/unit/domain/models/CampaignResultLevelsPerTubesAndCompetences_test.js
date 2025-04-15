import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CampaignResultLevelPerTubesAndCompetences', function () {
  describe('compute', function () {
    let learningContent, keData;

    beforeEach(function () {
      const framework = domainBuilder.buildFramework({ id: 'frameworkId', name: 'frameworkName' });
      const skill1 = domainBuilder.buildSkill({
        id: 'recSkillWeb1',
        tubeId: 'tube1',
        difficulty: 1,
      });
      const skill2 = domainBuilder.buildSkill({
        id: 'recSkillWeb2',
        tubeId: 'tube1',
        difficulty: 2,
      });
      const skill3 = domainBuilder.buildSkill({
        id: 'recSkillUrl1',
        tubeId: 'tube2',
        difficulty: 3,
      });
      const skill4 = domainBuilder.buildSkill({
        id: 'recSkillUrl2',
        tubeId: 'tube2',
        difficulty: 4,
      });

      const tube1 = domainBuilder.buildTube({
        id: 'tube1',
        competenceId: 'competence1',
        skills: [skill1, skill2],
        practicalTitle: 'tube 1',
        practicalDescription: 'tube 1 description',
      });
      const tube2 = domainBuilder.buildTube({
        id: 'tube2',
        competenceId: 'competence2',
        skills: [skill3, skill4],
        practicalTitle: 'tube 2',
        practicalDescription: 'tube 2 description',
      });

      const competence1 = domainBuilder.buildCompetence({
        id: 'competence1',
        areaId: 'recArea1',
        tubes: [tube1],
        name: 'compétence 1',
        description: 'description compétence 1',
      });
      const competence2 = domainBuilder.buildCompetence({
        id: 'competence2',
        areaId: 'recArea1',
        tubes: [tube2],
        name: 'compétence 2',
        description: 'description compétence 2',
      });

      const area = domainBuilder.buildArea({ id: 'recArea1', frameworkId: framework.id });
      const thematic1 = domainBuilder.buildThematic({
        id: 'thematic1',
        competenceId: 'competence1',
        tubeIds: ['tube1'],
      });
      const thematic2 = domainBuilder.buildThematic({
        id: 'thematic2',
        competenceId: 'competence2',
        tubeIds: ['tube2'],
      });
      competence1.thematics = [thematic1];
      competence2.thematics = [thematic2];
      area.competences = [competence1, competence2];
      framework.areas = [area];

      learningContent = domainBuilder.buildLearningContent([framework]);

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

    it('should get max level per tube', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });

      expect(campaignResult.levelsPerTube).deep.equal([
        {
          id: 'tube1',
          competenceId: 'competence1',
          practicalTitle: 'tube 1',
          practicalDescription: 'tube 1 description',
          maxLevel: 2,
          meanLevel: 0.5,
        },
        {
          id: 'tube2',
          competenceId: 'competence2',
          practicalTitle: 'tube 2',
          practicalDescription: 'tube 2 description',
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

      expect(campaignResult.levelsPerCompetence).deep.equal([
        {
          id: 'competence1',
          index: '1.1',
          name: 'compétence 1',
          description: 'description compétence 1',
          maxLevel: 2,
          meanLevel: 0.5,
        },
        {
          id: 'competence2',
          index: '1.1',
          name: 'compétence 2',
          description: 'description compétence 2',
          maxLevel: 4,
          meanLevel: 2,
        },
      ]);
    });

    it('should compute the maximum reachable level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });
      expect(campaignResult.maxReachableLevel).equal(3);
    });

    it('should compute the mean reached level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });
      expect(campaignResult.meanReachedLevel).equal(1.25);
    });
  });
});
