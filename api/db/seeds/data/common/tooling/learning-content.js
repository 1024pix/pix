import _ from 'lodash';
import * as competenceRepository from '../../../../../lib/infrastructure/repositories/competence-repository.js';
import { skillDatasource } from '../../../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';

let ALL_COMPETENCES, ALL_ACTIVE_SKILLS;

async function getAllCompetences() {
  if (!ALL_COMPETENCES) {
    ALL_COMPETENCES = await competenceRepository.list();
  }
  return ALL_COMPETENCES;
}

async function getAllActiveSkills() {
  if (!ALL_ACTIVE_SKILLS) {
    ALL_ACTIVE_SKILLS = await skillDatasource.findActive();
  }
  return ALL_ACTIVE_SKILLS;
}

async function findActiveSkillsByCompetenceId(competenceId) {
  const allSkills = await getAllActiveSkills();
  return _.filter(allSkills, { competenceId });
}

async function findActiveSkillsByTubeId(tubeId) {
  const allSkills = await getAllActiveSkills();
  return _.filter(allSkills, { tubeId });
}

export { getAllCompetences, findActiveSkillsByCompetenceId, findActiveSkillsByTubeId };
