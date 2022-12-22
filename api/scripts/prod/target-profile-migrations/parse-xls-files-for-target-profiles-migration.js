require('dotenv').config();
const _ = require('lodash');
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../../db/knex-database-connection');

let allSkills;
let allTubes;
async function _cacheLearningContentData() {
  const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
  allSkills = await skillRepository.list();
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  allTubes = await tubeRepository.list();
}

async function doJob(mainFile, multiFormFiles) {
  const dryRun = process.env.DRY_RUN === 'true';
  await _cacheLearningContentData();
  const mainData = parseMainFile(mainFile);
  const multiFormData = multiFormFiles
    .map((multiFormFile) => parseMultiformFile(multiFormFile))
    .reduce((acc, data) => ({ ...acc, ...data }));
  await migrateTargetProfiles(mainData['PRO'], multiFormData, dryRun);
  await migrateTargetProfiles(mainData['SUP'], multiFormData, dryRun);
}

const tabs = {
  PRO: {
    sheetToJsonConfig: {
      header: ['id', 'name', undefined, undefined, 'obsolete', 'auto', 'uncap', 'uniformCap', 'multiformCap'],
      range: 2,
    },
    mapper: (line) => ({
      ...line,
      obsolete: line.obsolete?.toLowerCase().trim() === 'obsolete',
      auto: !ouiNonToBoolean(line.auto),
      uncap: ouiNonToBoolean(line.uncap),
      multiformCap: ouiNonToBoolean(line.multiformCap),
    }),
  },
  SUP: {
    sheetToJsonConfig: {
      header: ['id', 'name', 'auto', 'uncap', 'uniformCap', 'multiformCap'],
      range: 2,
    },
    mapper: (line) => ({
      ...line,
      auto: !ouiNonToBoolean(line.auto),
      uncap: ouiNonToBoolean(line.uncap),
      multiformCap: ouiNonToBoolean(line.multiformCap),
    }),
  },
};

function parseMainFile(file) {
  const workbook = XLSX.readFile(file);

  return Object.fromEntries(
    Object.entries(tabs).map(([tab, { sheetToJsonConfig, mapper = (_) => _ }]) => [
      tab,
      XLSX.utils.sheet_to_json(workbook.Sheets[tab], sheetToJsonConfig).map(mapper),
    ])
  );
}

function parseMultiformFile(file) {
  const workbook = XLSX.readFile(file);

  return Object.fromEntries(
    Object.entries(workbook.Sheets).map(([tab, sheet]) => [
      tab,
      XLSX.utils.sheet_to_json(sheet, { header: ['name', 'level'], range: 1 }),
    ])
  );
}

function ouiNonToBoolean(s, defaultValue = false) {
  return s?.toLowerCase().trim().startsWith('o') ?? defaultValue;
}

async function migrateTargetProfiles(targetProfiles, multiFormData, dryRun) {
  for (const targetProfile of targetProfiles) {
    try {
      await knex.transaction(async (trx) => {
        const exists = await _checkIfTPExists(targetProfile.id, trx);
        if (!exists) {
          logger.warn(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible introuvable`
          );
          return;
        }
        const alreadyHasTubes = await _checkIfTPAlreadyHasTubes(targetProfile.id, trx);
        if (alreadyHasTubes) {
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible déja migré`
          );
          return;
        }
        await _doAutomaticMigration(targetProfile.id, trx);
        if (targetProfile.obsolete) {
          await _outdate(targetProfile.id, trx);
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible marqué comme obsolète`
          );
          if (dryRun) throw new Error('dryrun');
          return;
        }
        if (targetProfile.auto) {
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible migré automatiquement`
          );
          if (dryRun) throw new Error('dryrun');
          return;
        }
        if (targetProfile.uncap) {
          await _uncap(targetProfile.id, trx);
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible décappé`
          );
          if (dryRun) throw new Error('dryrun');
          return;
        }
        if (typeof targetProfile.uniformCap === 'number') {
          await _uniformCap(targetProfile.id, targetProfile.uniformCap, trx);
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible cappé uniformément à %s`,
            targetProfile.uniformCap
          );
          if (dryRun) throw new Error('dryrun');
          return;
        }
        if (targetProfile.multiformCap) {
          const targetProfileMultiFormData = multiFormData[targetProfile.id];
          if (!targetProfileMultiFormData) {
            logger.error(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible cappé multiforme sans instructions`
            );
            if (dryRun) throw new Error('dryrun');
            return;
          }
          if (await _multiformCap(targetProfile, targetProfileMultiFormData, trx))
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible cappé multiformément`
            );
          if (dryRun) throw new Error('dryrun');
          return;
        }
        throw new Error('Aucune action définie pour le profil cible');
      });
    } catch (e) {
      logger.error(
        { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
        `Erreur lors de la migration d'un profil cible: %s`,
        e
      );
    }
  }
}

async function _checkIfTPExists(id, trx) {
  const potentialTP = await trx('target-profiles').where({ id }).first();
  return Boolean(potentialTP);
}

async function _checkIfTPAlreadyHasTubes(id, trx) {
  const potentialTube = await trx('target-profile_tubes').where({ targetProfileId: id }).first();
  return Boolean(potentialTube);
}

async function _doAutomaticMigration(id, trx) {
  const skillIds = await trx('target-profiles_skills').pluck('skillId').where({ targetProfileId: id });
  const skills = skillIds.map((skillId) => {
    const foundSkill = allSkills.find((skill) => skill.id === skillId);
    if (!foundSkill) throw new Error(`L'acquis "${skillId}" n'existe pas dans le référentiel.`);
    if (!foundSkill.tubeId) throw new Error(`L'acquis "${skillId}" n'appartient à aucun sujet.`);
    const tubeExists = Boolean(allTubes.find((tube) => tube.id === foundSkill.tubeId));
    if (!tubeExists) throw new Error(`Le sujet "${foundSkill.tubeId}" n'existe pas dans le référentiel.`);
    return foundSkill;
  });
  const skillsGroupedByTubeId = _.groupBy(skills, 'tubeId');
  const tubes = [];
  for (const [tubeId, skills] of Object.entries(skillsGroupedByTubeId)) {
    const skillWithHighestDifficulty = _.maxBy(skills, 'difficulty');
    tubes.push({
      tubeId,
      level: skillWithHighestDifficulty.difficulty,
    });
  }
  const completeTubes = tubes.map((tube) => {
    return { ...tube, targetProfileId: id };
  });
  await trx.batchInsert('target-profile_tubes', completeTubes);
}

async function _outdate(id, trx) {
  await trx('target-profiles').update({ outdated: true }).where({ id });
}

async function _uncap(id, trx) {
  await trx('target-profile_tubes').update({ level: 8 }).where({ targetProfileId: id });
}

async function _uniformCap(id, cap, trx) {
  await trx('target-profile_tubes').update({ level: cap }).where({ targetProfileId: id });
}

async function _multiformCap(targetProfile, instructions, trx) {
  const tubeNames = instructions.map(({ name }) => name);
  const nonExistentTubes = tubeNames.filter((tubeName) => !allTubes.find((tube) => tube.name === tubeName));
  if (nonExistentTubes.length > 0) {
    logger.error(
      { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
      `Les sujets suivants n'existent pas : %s`,
      nonExistentTubes
    );
    return false;
  }
  const fullInstructions = instructions.map(({ name, level }) => {
    const id = allTubes.find((tube) => tube.name === name).id;
    return { id, name, level };
  });
  const tubeIds = fullInstructions.map(({ id }) => id);
  const targetProfileTubeIds = await trx('target-profile_tubes')
    .pluck('tubeId')
    .where({ targetProfileId: targetProfile.id });
  const tubeIdsInTpNotInInstructions = targetProfileTubeIds.filter((id) => !tubeIds.includes(id));
  const tubeIdsInInstructionNotInTp = tubeIds.filter((id) => !targetProfileTubeIds.includes(id));
  if (tubeIdsInTpNotInInstructions.length > 0) {
    const errorTubeNames = tubeIdsInTpNotInInstructions.map((id) => allTubes.find((tube) => tube.id === id).name);
    logger.error(
      { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
      `Les sujets suivants sont présents dans le profil cible mais pas dans les instructions : %s`,
      errorTubeNames
    );
    return false;
  }
  if (tubeIdsInInstructionNotInTp.length > 0) {
    const errorTubeNames = tubeIdsInInstructionNotInTp.map((id) => allTubes.find((tube) => tube.id === id).name);
    logger.error(
      { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
      `Les sujets suivants sont présents dans les instructions mais pas dans le profil cible : %s`,
      errorTubeNames
    );
    return false;
  }
  for (const { id, level } of fullInstructions) {
    await trx('target-profile_tubes').update({ level }).where({ targetProfileId: targetProfile.id, tubeId: id });
  }
  return true;
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const [, , mainFile, ...multiFormFiles] = process.argv;
  await doJob(mainFile, multiFormFiles);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
    }
  }
})();

module.exports = { doJob };
