require('dotenv').config();
import _ from 'lodash';
import { knex, disconnect } from '../../../db/knex-database-connection';
import logger from '../../../lib/infrastructure/logger';
import cache from '../../../lib/infrastructure/caches/learning-content-cache';

let allSkills;
let allTubes;
async function _cacheLearningContentData() {
  const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
  allSkills = await skillRepository.list();
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  allTubes = await tubeRepository.list();
}

async function main() {
  try {
    await doJob();
  } catch (err) {
    logger.error(err);
    throw err;
  } finally {
    await disconnect();
    await cache.quit();
  }
}

async function doJob() {
  await _cacheLearningContentData();
  const targetProfileIds = await _findTargetProfileIdsToConvert();
  if (targetProfileIds.length === 0) {
    logger.info('Aucun profil cible à convertir.');
    return;
  }
  logger.info(`${targetProfileIds.length} à convertir...`);
  for (const targetProfileId of targetProfileIds) {
    const trx = await knex.transaction();
    try {
      logger.info(`Conversion de ${targetProfileId}...`);
      await _convertTargetProfile(targetProfileId, trx);
      await trx.commit();
    } catch (err) {
      logger.error(`${targetProfileId} Echec. Raison : ${err}`);
      await trx.rollback();
    }
  }
}

async function _findTargetProfileIdsToConvert() {
  const ids = await knex('target-profiles')
    .pluck('target-profiles.id')
    .leftJoin('target-profile_tubes', 'target-profile_tubes.targetProfileId', 'target-profiles.id')
    .whereNull('target-profile_tubes.id');
  return _.uniq(ids);
}

async function _convertTargetProfile(targetProfileId, trx) {
  const skillIds = await _findSkillIds(targetProfileId, trx);
  if (skillIds.length === 0) throw new Error("Le profil cible n'a pas d'acquis.");

  const tubes = await _computeTubeIdsAndLevelsForSkills(skillIds);

  await _createTargetProfileTubes(targetProfileId, tubes, trx);
  logger.info(`${targetProfileId} OK. ${tubes.length} tubes créés.`);
}

async function _findSkillIds(targetProfileId, trx) {
  return trx('target-profiles_skills').pluck('skillId').where('targetProfileId', targetProfileId);
}

async function _computeTubeIdsAndLevelsForSkills(skillIds) {
  const skills = _findSkills(skillIds);
  const skillsGroupedByTubeId = _.groupBy(skills, 'tubeId');
  const tubes = [];
  for (const [tubeId, skills] of Object.entries(skillsGroupedByTubeId)) {
    const skillWithHighestDifficulty = _.maxBy(skills, 'difficulty');
    tubes.push({
      tubeId,
      level: skillWithHighestDifficulty.difficulty,
    });
  }
  return tubes;
}

function _findSkills(skillIds) {
  return skillIds.map((skillId) => {
    const foundSkill = allSkills.find((skill) => skill.id === skillId);
    if (!foundSkill) throw new Error(`L'acquis "${skillId}" n'existe pas dans le référentiel.`);
    if (!foundSkill.tubeId) throw new Error(`L'acquis "${skillId}" n'appartient à aucun sujet.`);
    const tubeExists = _doesTubeExist(foundSkill.tubeId);
    if (!tubeExists) throw new Error(`Le sujet "${foundSkill.tubeId}" n'existe pas dans le référentiel.`);
    return foundSkill;
  });
}

function _doesTubeExist(tubeId) {
  return Boolean(allTubes.find((tube) => tube.id === tubeId));
}

async function _createTargetProfileTubes(targetProfileId, tubes, trx) {
  const completeTubes = tubes.map((tube) => {
    return { ...tube, targetProfileId };
  });
  await trx.batchInsert('target-profile_tubes', completeTubes);
}

if (require.main === module) {
  main();
}

export default {
  doJob,
};
