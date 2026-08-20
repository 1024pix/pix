import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { buildArea } from '../../build-area.js';
import { buildCompetence } from '../../build-competence.js';
import { buildFramework } from '../../build-framework.js';
import { buildKnowledgeState } from '../../build-knowledge-state.js';
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

  const statesByParticipation = {
    participationId1: buildKnowledgeState({ tubes: [{ tubeId: skill1.tubeId, floor: 1, directLevels: [1] }] }),
    participationId2: buildKnowledgeState({ tubes: [{ tubeId: skill2.tubeId, ceiling: 2, directLevels: [2] }] }),
    participationId3: buildKnowledgeState({ tubes: [{ tubeId: skill3.tubeId, ceiling: 3, directLevels: [3] }] }),
  };

  const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
    id: 1,
    learningContent,
  });

  campaignResult.addKnowledgeStates(statesByParticipation);
  return campaignResult;
}
export { buildCampaignResultLevelsPerTubesAndCompetences };
