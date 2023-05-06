const _ = require('lodash');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const { skillDatasource } = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

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

module.exports = {
  getAllCompetences,
  findActiveSkillsByCompetenceId,
  findActiveSkillsByTubeId,
};
