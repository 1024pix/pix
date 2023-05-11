const _ = require('lodash');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../../../../lib/infrastructure/repositories/challenge-repository');
const { skillDatasource } = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

let ALL_COMPETENCES, ALL_ACTIVE_SKILLS, ALL_CHALLENGES;

async function getAllCompetences() {
  if (!ALL_COMPETENCES) {
    ALL_COMPETENCES = await competenceRepository.list();
  }
  return ALL_COMPETENCES;
}

async function getAllChallenges() {
  if (!ALL_CHALLENGES) {
    ALL_CHALLENGES = await challengeRepository.list();
  }
  return ALL_CHALLENGES;
}

async function getCoreCompetences() {
  const allCompetences = await getAllCompetences();
  return allCompetences.filter((competence) => competence.origin === 'Pix');
}

async function getDroitCompetences() {
  const allCompetences = await getAllCompetences();
  return allCompetences.filter((competence) => competence.origin === 'Droit');
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

async function findFirstValidatedChallengeBySkillId(skillId) {
  const allChallenges = await getAllChallenges();
  return _.find(allChallenges, { status: 'validé', skill: { id: skillId } });
}

module.exports = {
  getAllCompetences,
  getCoreCompetences,
  getDroitCompetences,
  findActiveSkillsByCompetenceId,
  findActiveSkillsByTubeId,
  findFirstValidatedChallengeBySkillId,
};
