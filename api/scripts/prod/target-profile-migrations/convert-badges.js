require('dotenv').config();
const _ = require('lodash');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

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
  const badgeIds = await _findBadgeIdsToConvert();
  if (badgeIds.length === 0) {
    logger.info('Aucun RT à convertir.');
    return;
  }
  logger.info(`${badgeIds.length} à convertir...`);
  for (const badgeId of badgeIds) {
    const trx = await knex.transaction();
    try {
      logger.info(`Conversion de ${badgeId}...`);
      const targetProfileTubes = await _findTargetProfileTubes(badgeId, trx);
      await _convertBadge(badgeId, targetProfileTubes, trx);
      await _deleteSkillSetCriteria(badgeId, trx);
      await trx.commit();
    } catch (err) {
      logger.error(`${badgeId} Echec. Raison : ${err}`);
      await trx.rollback();
    }
  }
}

async function _findBadgeIdsToConvert() {
  const ids = await knex('badge-criteria').pluck('badgeId').where('scope', 'SkillSet');
  return _.uniq(ids);
}

async function _findTargetProfileTubes(badgeId, trx) {
  return trx('target-profile_tubes')
    .select({
      id: 'tubeId',
      level: 'level',
    })
    .join('target-profiles', 'target-profiles.id', 'target-profile_tubes.targetProfileId')
    .join('badges', 'badges.targetProfileId', 'target-profiles.id')
    .where('badges.id', badgeId);
}

async function _convertBadge(badgeId, targetProfileTubes, trx) {
  const criteria = await trx('badge-criteria').select('threshold', 'skillSetIds').where({ scope: 'SkillSet', badgeId });
  const newCriteria = [];
  for (const { threshold, skillSetIds } of criteria) {
    for (const skillSetId of skillSetIds) {
      const skillSet = await trx('skill-sets').select('name', 'skillIds').where({ id: skillSetId }).first();
      const tubesWithLevel = await _computeTubeIdsAndLevelsForSkills(skillSet.skillIds);
      _checkBadgeCriterionCappedTubesWithinTargetProfileCappedTubes(tubesWithLevel, targetProfileTubes);
      newCriteria.push({
        name: skillSet.name,
        threshold,
        scope: 'CappedTubes',
        cappedTubes: JSON.stringify(tubesWithLevel),
        badgeId,
      });
    }
  }
  await trx.batchInsert('badge-criteria', newCriteria);
}

async function _computeTubeIdsAndLevelsForSkills(skillIds) {
  const skills = _findSkills(skillIds);
  const skillsGroupedByTubeId = _.groupBy(skills, 'tubeId');
  const tubes = [];
  for (const [tubeId, skills] of Object.entries(skillsGroupedByTubeId)) {
    const skillWithHighestDifficulty = _.maxBy(skills, 'difficulty');
    tubes.push({
      id: tubeId,
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
    const tube = allTubes.find((tube) => tube.id === foundSkill.tubeId);
    if (!tube) throw new Error(`Le sujet "${foundSkill.tubeId}" n'existe pas dans le référentiel.`);
    return foundSkill;
  });
}

function _checkBadgeCriterionCappedTubesWithinTargetProfileCappedTubes(badgeCappedTubes, targetProfileCappedTubes) {
  for (const badgeCappedTube of badgeCappedTubes) {
    const tubeInTargetProfile = targetProfileCappedTubes.find((cappedTube) => cappedTube.id === badgeCappedTube.id);
    if (!tubeInTargetProfile)
      throw new Error('Le RT contient des acquis qui ne sont pas compris dans le profil cible.');
    if (badgeCappedTube.level > tubeInTargetProfile.level)
      throw new Error('Le RT contient des acquis avec un niveau supérieur au profil cible.');
  }
}

async function _deleteSkillSetCriteria(badgeId, trx) {
  await trx('badge-criteria').where({ badgeId, scope: 'SkillSet' }).del();
}

if (require.main === module) {
  main();
}

module.exports = {
  doJob,
};
