import perf_hooks from 'node:perf_hooks';
const { performance } = perf_hooks;

import _ from 'lodash';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import * as campaignRepository from '../../lib/infrastructure/repositories/campaign-repository.js';
import { ComplementaryCertificationKeys } from '../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { learningContentCache as cache } from '../../src/shared/infrastructure/caches/learning-content-cache.js';
import * as challengeRepository from '../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../src/shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../src/shared/infrastructure/repositories/skill-repository.js';
import { temporaryStorage } from '../../src/shared/infrastructure/temporary-storage/index.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

let allChallenges = [];
let allPixCompetences = [];
let allDroitCompetences = [];
let allEduCompetences = [];
const skillsByCompetenceId = {};

async function makeUserPixCertifiable({ userId, countCertifiableCompetences, levelOnEachCompetence, databaseBuilder }) {
  await _cacheLearningContent();
  const assessmentId = _createComplementeCompetenceEvaluationAssessment({ userId, databaseBuilder });
  const pickedCompetences = _pickRandomPixCompetences(countCertifiableCompetences);
  _.each(pickedCompetences, (competence) => {
    _makePixCompetenceCertifiable({ userId, databaseBuilder, competence, levelOnEachCompetence, assessmentId });
  });
}

async function makeUserPixDroitCertifiable({ userId, databaseBuilder }) {
  await _cacheLearningContent();
  const assessmentId = _createComplementeCompetenceEvaluationAssessment({ userId, databaseBuilder });
  _.each(allDroitCompetences, (competence) => {
    _makePlusCompetenceCertifiable({ userId, databaseBuilder, competence, assessmentId });
  });
}

async function makeUserPixEduCertifiable({ userId, databaseBuilder }) {
  await _cacheLearningContent();
  const assessmentId = _createComplementeCompetenceEvaluationAssessment({ userId, databaseBuilder });
  _.each(allEduCompetences, (competence) => {
    _makePlusCompetenceCertifiable({ userId, databaseBuilder, competence, assessmentId });
  });
}

async function makeUserCleaCertifiable({ userId, databaseBuilder }) {
  await _cacheLearningContent();
  const assessmentId = _createComplementeCompetenceEvaluationAssessment({ userId, databaseBuilder });
  const [campaignId] = await knex
    .from('badges')
    .pluck('campaigns.id')
    .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .innerJoin('campaigns', 'campaigns.targetProfileId', 'badges.targetProfileId')
    .where({ 'complementary-certifications.key': ComplementaryCertificationKeys.CLEA })
    .whereNull('complementary-certification-badges.detachedAt');

  const skillIds = await campaignRepository.findSkillIds({ campaignId });

  for (const skillId of skillIds) {
    const skill = await skillRepository.get(skillId);
    await _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder });
  }
}

async function executeScript({ processArgvs, scriptFn, disconnectAndExit = true }) {
  const startTime = performance.now();
  const scriptName = processArgvs[1].split('scripts/')?.[1] ?? processArgvs[1];
  const command = `${scriptName} ${processArgvs.slice(2).join(' ')}`.trim();
  const [{ id: scriptExecId }] = await knex('script-executions').insert({ scriptName, command }).returning(['id']);
  let scriptErr;
  let processExitCode;
  try {
    logger.info(`Script "${command}" has started.`);
    await scriptFn();
    logger.info('Script executed successfully !');
    processExitCode = 0;
  } catch (error) {
    scriptErr = JSON.stringify(error);
    logger.error(`Script encountered an error : \n${scriptErr}.`);
    processExitCode = 1;
  } finally {
    await knex('script-executions')
      .update({
        endedAt: knex.fn.now(),
        error: scriptErr ?? null,
      })
      .where({ id: scriptExecId });
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    logger.info(`Script has ended: took ${duration} milliseconds.`);
    if (disconnectAndExit) {
      await disconnect();
      await cache.quit();
      await temporaryStorage.quit();
      // eslint-disable-next-line n/no-process-exit
      process.exit(processExitCode);
    }
  }
}

function _createComplementeCompetenceEvaluationAssessment({ databaseBuilder, userId }) {
  return databaseBuilder.factory.buildAssessment({
    userId,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
}

async function _cacheLearningContent() {
  if (allChallenges.length === 0) {
    const allCompetences = await competenceRepository.list();
    allChallenges = await challengeRepository.list('fr-fr');
    allPixCompetences = _.filter(allCompetences, { origin: 'Pix' });
    allDroitCompetences = _.filter(allCompetences, { origin: 'Droit' });
    allEduCompetences = _.filter(allCompetences, { origin: 'Edu' });

    for (const competence of allCompetences) {
      skillsByCompetenceId[competence.id] = await skillRepository.findActiveByCompetenceId(competence.id);
    }
  }
}

function _pickRandomPixCompetences(countCompetences) {
  const shuffledCompetences = _.sortBy(allPixCompetences, () => _.random(0, 100));
  return _.slice(shuffledCompetences, 0, countCompetences);
}

function _makePixCompetenceCertifiable({ databaseBuilder, userId, competence, levelOnEachCompetence, assessmentId }) {
  const skillsToValidate = _findSkillsToValidateSpecificLevel(competence, levelOnEachCompetence);
  _.each(skillsToValidate, (skill) => {
    _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder });
  });
}

function _makePlusCompetenceCertifiable({ databaseBuilder, userId, competence, assessmentId }) {
  const skillsToValidate = skillsByCompetenceId[competence.id];
  _.each(skillsToValidate, (skill) => {
    _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder });
  });
}

function _findSkillsToValidateSpecificLevel(competence, expectedLevel) {
  const skills = skillsByCompetenceId[competence.id];
  const orderedByDifficultySkills = _(skills)
    .map((skill) => {
      skill.difficulty = parseInt(skill.name.slice(-1));
      return skill;
    })
    .sortBy('difficulty')
    .value();
  const pickedSkills = [];
  let pixScore = 0;
  while ((pixScore < 8 * expectedLevel || pickedSkills.length < 3) && orderedByDifficultySkills.length > 0) {
    const currentSkill = orderedByDifficultySkills.shift();
    pixScore += currentSkill.pixValue;
    pickedSkills.push(currentSkill);
  }
  return pickedSkills;
}

function _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder }) {
  const challenge = _findFirstChallengeValidatedBySkillId(skill.id);
  if (!challenge) {
    logger.warn(`There is no challenge for skill ${skill.id}`);
    return;
  }
  const answerId = databaseBuilder.factory.buildAnswer({
    value: 'dummy value',
    result: 'ok',
    assessmentId,
    challengeId: challenge.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    timeout: null,
    resultDetails: 'dummy value',
  }).id;
  databaseBuilder.factory.buildKnowledgeElement({
    source: 'direct',
    status: 'validated',
    answerId,
    assessmentId,
    skillId: skill.id,
    createdAt: new Date(),
    earnedPix: skill.pixValue,
    userId,
    competenceId: skill.competenceId,
  });
}

function _findFirstChallengeValidatedBySkillId(skillId) {
  return _.find(allChallenges, { status: 'validé', skill: { id: skillId } });
}

export {
  executeScript,
  makeUserCleaCertifiable,
  makeUserPixCertifiable,
  makeUserPixDroitCertifiable,
  makeUserPixEduCertifiable,
};
