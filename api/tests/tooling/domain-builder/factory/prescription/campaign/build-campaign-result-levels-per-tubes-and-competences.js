import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { buildArea } from '../../build-area.js';
import { buildCompetence } from '../../build-competence.js';
import { buildFramework } from '../../build-framework.js';
import { buildKnowledgeElement } from '../../build-knowledge-element.js';
import { buildLearningContent } from '../../build-learning-content.js';
import { buildSkill } from '../../build-skill.js';
import { buildThematic } from '../../build-thematic.js';
import { buildTube } from '../../build-tube.js';

function buildCampaignResultLevelsPerTubesAndCompetences() {
  const framework = buildFramework({ id: 'frameworkId', name: 'frameworkName' });
  const skill1 = buildSkill({
    id: 'recSkillWeb1',
    tubeId: 'tube1',
    difficulty: 1,
  });
  const skill2 = buildSkill({
    id: 'recSkillWeb2',
    tubeId: 'tube2',
    difficulty: 2,
  });
  const skill3 = buildSkill({
    id: 'recSkillWeb2',
    tubeId: 'tube2',
    difficulty: 3,
  });

  const tube1 = buildTube({
    id: 'tube1',
    competenceId: 'competence1',
    skills: [skill1, skill2, skill3],
    practicalTitle: 'tube 1',
    practicalDescription: 'tube 1 description',
  });

  const competence1 = buildCompetence({
    id: 'competence1',
    areaId: 'recArea1',
    tubes: [tube1],
    name: 'compétence 1',
    description: 'description compétence 1',
  });

  const area = buildArea({ id: 'recArea1', frameworkId: framework.id });
  const thematic1 = buildThematic({
    id: 'thematic1',
    competenceId: 'competence1',
    tubeIds: ['tube1'],
  });

  competence1.thematics = [thematic1];
  area.competences = [competence1];
  framework.areas = [area];

  const learningContent = buildLearningContent([framework]);

  const user1ke1 = buildKnowledgeElement({
    status: KnowledgeElement.StatusType.VALIDATED,
    skillId: skill1.id,
    userId: 1,
  });

  const user2ke1 = buildKnowledgeElement({
    status: KnowledgeElement.StatusType.INVALIDATED,
    skillId: skill2.id,
    userId: 2,
  });

  const user3ke1 = buildKnowledgeElement({
    status: KnowledgeElement.StatusType.INVALIDATED,
    skillId: skill3.id,
    userId: 3,
  });

  const keData = {
    participationId1: new KnowledgeElementCollection([user1ke1]).latestUniqNonResetKnowledgeElements,
    participationId2: new KnowledgeElementCollection([user2ke1]).latestUniqNonResetKnowledgeElements,
    participationId3: new KnowledgeElementCollection([user3ke1]).latestUniqNonResetKnowledgeElements,
  };

  const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
    campaignId: 1,
    learningContent,
  });

  campaignResult.addKnowledgeElementSnapshots(keData);
  return campaignResult;
}
export { buildCampaignResultLevelsPerTubesAndCompetences };
