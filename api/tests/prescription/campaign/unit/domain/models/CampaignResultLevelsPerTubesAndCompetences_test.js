import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CampaignResultLevelsPerTubesAndCompetences', function () {
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
        participationId1: KnowledgeElement.toLatestUniqNonResetCollection([user1ke1, user1ke2]),
        participationId2: KnowledgeElement.toLatestUniqNonResetCollection([user2ke1, user2ke2]),
      };
    });

    it('should get max level per tube', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        id: 1,
        learningContent,
      });
      campaignResult.addKnowledgeElementSnapshots(keData);

      expect(campaignResult.levelsPerTube).to.deep.equal([
        {
          id: 'tube1',
          competenceId: 'competence1',
          competenceName: 'compétence 1',
          title: 'tube 1',
          description: 'tube 1 description',
          maxLevel: 2,
          meanLevel: 0.5,
        },
        {
          id: 'tube2',
          competenceId: 'competence2',
          competenceName: 'compétence 2',
          title: 'tube 2',
          description: 'tube 2 description',
          maxLevel: 4,
          meanLevel: 2,
        },
      ]);
    });

    it('should get max level per competence', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        id: 1,
        learningContent,
      });
      campaignResult.addKnowledgeElementSnapshots(keData);

      expect(campaignResult.levelsPerCompetence[0].id).to.deep.equal('competence1');
      expect(campaignResult.levelsPerCompetence[0].index).to.deep.equal('1.1');
      expect(campaignResult.levelsPerCompetence[0].name).to.deep.equal('compétence 1');
      expect(campaignResult.levelsPerCompetence[0].description).to.deep.equal('description compétence 1');
      expect(campaignResult.levelsPerCompetence[0].maxLevel).to.deep.equal(2);
      expect(campaignResult.levelsPerCompetence[0].meanLevel).to.deep.equal(0.5);

      expect(campaignResult.levelsPerCompetence[1].id).to.deep.equal('competence2');
      expect(campaignResult.levelsPerCompetence[1].index).to.deep.equal('1.1');
      expect(campaignResult.levelsPerCompetence[1].name).to.deep.equal('compétence 2');
      expect(campaignResult.levelsPerCompetence[1].description).to.deep.equal('description compétence 2');
      expect(campaignResult.levelsPerCompetence[1].maxLevel).to.deep.equal(4);
      expect(campaignResult.levelsPerCompetence[1].meanLevel).to.deep.equal(2);
    });

    it('should compute the maximum reachable level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        id: 1,
        learningContent,
      });
      campaignResult.addKnowledgeElementSnapshots(Object.values(keData));

      expect(campaignResult.maxReachableLevel).equal(3);
    });

    it('should compute the mean reached level', function () {
      const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
        id: 1,
        learningContent,
      });
      campaignResult.addKnowledgeElementSnapshots(Object.values(keData));

      expect(campaignResult.meanReachedLevel).equal(1.25);
    });
  });
});
