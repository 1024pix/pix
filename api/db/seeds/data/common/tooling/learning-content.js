import _ from 'lodash';

import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../../src/shared/infrastructure/repositories/skill-repository.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';

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
    ALL_CHALLENGES = await challengeRepository.list_proxy('fr-fr');
  }
  return ALL_CHALLENGES;
}

async function getCoreCompetences() {
  const allCompetences = await getAllCompetences();
  return allCompetences.filter((competence) => competence.origin === 'Pix');
}

async function getAllActiveSkills() {
  if (!ALL_ACTIVE_SKILLS) {
    ALL_ACTIVE_SKILLS = (await skillRepository.list()).filter((skill) => skill.status === 'actif');
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
  if (!validatedChallengesBySkill[skillId]) {
    logger.warn(`Skill ${skillId} has no validated challenges`);
    return null;
  }
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
    const validatedChallenges = allChallenges.filter((challenge) => challenge.status === 'validé');
    VALIDATED_CHALLENGES_BY_SKILL = Object.groupBy(validatedChallenges, (challenge) => challenge.skillId);
  }
  return VALIDATED_CHALLENGES_BY_SKILL;
}

export {
  findActiveSkillsByCompetenceId,
  findActiveSkillsByTubeId,
  findFirstValidatedChallengeBySkillId,
  getAllCompetences,
  getCoreCompetences,
};
