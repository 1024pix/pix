import _ from 'lodash';
import * as competenceRepository from '../../../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as challengeRepository from '../../../../../lib/infrastructure/repositories/challenge-repository.js';
import { skillDatasource } from '../../../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';

let ALL_COMPETENCES, ALL_ACTIVE_SKILLS, ALL_CHALLENGES, ACTIVE_SKILLS_BY_COMPETENCE, ACTIVE_SKILLS_BY_TUBE;
let VALIDATED_CHALLENGES_BY_SKILL;

async function getAllCompetences() {
  if (!ALL_COMPETENCES) {
    ALL_COMPETENCES = await competenceRepository.list();
    ALL_COMPETENCES = _.filter(ALL_COMPETENCES, ({ origin }) => origin);
  }
  return ALL_COMPETENCES;
}

async function getAllChallenges() {
  if (!ALL_CHALLENGES) {
    ALL_CHALLENGES = await challengeRepository.list();
  }
  return ALL_CHALLENGES;
}

async function findCompetence(competenceId) {
  const allCompetences = await getAllCompetences();
  return _.find(allCompetences, { id: competenceId });
}

async function getCoreCompetences() {
  const allCompetences = await getAllCompetences();
  return allCompetences.filter((competence) => competence.origin === 'Pix');
}

async function getAllActiveSkills() {
  if (!ALL_ACTIVE_SKILLS) {
    ALL_ACTIVE_SKILLS = await skillDatasource.findActive();
  }
  return ALL_ACTIVE_SKILLS;
}

async function findActiveSkillsByCompetenceId(competenceId) {
  const activeSkillsByCompetence = await _getActiveSkillsByCompetence();
  return activeSkillsByCompetence[competenceId] || [];
}

async function findActiveSkillsByTubeId(tubeId) {
  const activeSkillsByTube = await _getActiveSkillsByTube();
  return activeSkillsByTube[tubeId] || [];
}

async function findFirstValidatedChallengeBySkillId(skillId) {
  const validatedChallengesBySkill = await _getValidatedChallengesBySkill();
  return validatedChallengesBySkill[skillId][0] || null;
}

async function _getActiveSkillsByTube() {
  if (!ACTIVE_SKILLS_BY_TUBE) {
    const allSkills = await getAllActiveSkills();
    ACTIVE_SKILLS_BY_TUBE = _.groupBy(allSkills, 'tubeId');
  }
  return ACTIVE_SKILLS_BY_TUBE;
}

async function _getActiveSkillsByCompetence() {
  if (!ACTIVE_SKILLS_BY_COMPETENCE) {
    const allSkills = await getAllActiveSkills();
    ACTIVE_SKILLS_BY_COMPETENCE = _.groupBy(allSkills, 'competenceId');
  }
  return ACTIVE_SKILLS_BY_COMPETENCE;
}

async function _getValidatedChallengesBySkill() {
  if (!VALIDATED_CHALLENGES_BY_SKILL) {
    const allChallenges = await getAllChallenges();
    const validatedChallenges = _.filter(allChallenges, { status: 'validé' });
    VALIDATED_CHALLENGES_BY_SKILL = _.groupBy(validatedChallenges, (challenge) => challenge.skill.id);
  }
  return VALIDATED_CHALLENGES_BY_SKILL;
}

async function findActiveSkillsByFrameworkName(frameworkName) {
  const allCompetences = await getAllCompetences();
  const competenceIds = _.filter(allCompetences, { origin: frameworkName }).map(({ id }) => id);
  const activeSkills = await getAllActiveSkills();
  return _.filter(activeSkills, (activeSkill) => competenceIds.includes(activeSkill.competenceId));
}

export {
  getAllCompetences,
  getCoreCompetences,
  findActiveSkillsByCompetenceId,
  findActiveSkillsByTubeId,
  findFirstValidatedChallengeBySkillId,
  findCompetence,
  findActiveSkillsByFrameworkName,
};
