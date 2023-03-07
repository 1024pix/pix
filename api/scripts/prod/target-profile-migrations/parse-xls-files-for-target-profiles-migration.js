require('dotenv').config({
  path: `${__dirname}/../../../.env`,
});
const _ = require('lodash');
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const { normalizeAndRemoveAccents } = require('../../../lib/domain/services/validation-treatments');
const { autoMigrateTargetProfile } = require('./common');

let allTubes;
async function _cacheLearningContentData() {
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  const tubes = await tubeRepository.list();
  allTubes = tubes.map((tube) => ({ ...tube, normalizedName: normalizeAndRemoveAccents(tube.name) }));
}
const report = [];

async function doJob(mainFile, multiFormFiles, dryRun) {
  const mainData = parseMainFile(mainFile);
  const multiFormData = multiFormFiles
    .map((multiFormFile) => parseMultiformFile(multiFormFile))
    .reduce((acc, data) => ({ ...acc, ...data }));
  await _cacheLearningContentData();
  await migrateTargetProfiles(mainData['PRO'], multiFormData, dryRun);
  await migrateTargetProfiles(mainData['SUP'], multiFormData, dryRun);
  if (dryRun) printReport();
}

function printReport() {
  console.log(`\n\n\n\n${report.join('\n')}`);
}

const mapperFnc = (line) => {
  try {
    return {
      ...line,
      obsolete: !ouiNonToBoolean(line.keep),
      auto:
        ouiNonToBoolean(line.keep) &&
        !ouiNonToBoolean(line.uncap) &&
        !ouiNonToBoolean(line.multiformCap) &&
        isEmpty(line.uniformCap),
      uniformCap: toLevel(line.uniformCap),
      uncap: ouiNonToBoolean(line.uncap),
      multiformCap: ouiNonToBoolean(line.multiformCap),
    };
  } catch (_e) {
    logger.error(
      { targetProfileId: line.id, targetProfileName: line.name },
      "Erreur lors de la migration d'un profil cible: Ligne EXCEL incorrecte, valeur de cellule invalide"
    );
    report.push(`${line.id} - ${line.name} : Ligne EXCEL incorrecte, valeur de cellule invalide`);
    return null;
  }
};

const tabs = {
  PRO: {
    sheetToJsonConfig: {
      header: ['id', 'name', undefined, undefined, undefined, 'keep', 'uncap', 'uniformCap', 'multiformCap'],
      range: 2,
    },
    mapper: mapperFnc,
  },
  SUP: {
    sheetToJsonConfig: {
      header: ['id', 'name', 'keep', 'uncap', 'uniformCap', 'multiformCap'],
      range: 2,
    },
    mapper: mapperFnc,
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
    Object.entries(workbook.Sheets).map(([tab, sheet]) => {
      const rowValues = XLSX.utils.sheet_to_json(sheet, { header: ['name', 'level'], range: 1 });
      return [
        tab,
        rowValues
          .filter(({ name }) => typeof name !== 'number' && name?.startsWith('@'))
          .map(({ level, name }) => ({ normalizedName: normalizeAndRemoveAccents(name), name, level })),
      ];
    })
  );
}

function ouiNonToBoolean(s) {
  if (typeof s === 'number') throw new Error();
  if (!s || s.length === 0) return false;
  if (s.toLowerCase().trim().startsWith('oui')) return true;
  if (s.toLowerCase().trim().startsWith('non')) return false;
  if (s.toLowerCase().trim() === '-') return false;
  throw new Error();
}

function isEmpty(s) {
  return typeof s === 'number' ? false : s?.trim().length !== 0;
}

function toLevel(s) {
  if (typeof s === 'number') {
    if (s > 8 || s < 1) throw new Error();
    return s;
  }
  if (!s || s.length === 0) return s;
  if (s.toLowerCase().trim().startsWith('non')) return s;
  if (s.toLowerCase().trim() === '-') return s;
  throw new Error();
}

async function migrateTargetProfiles(targetProfiles, multiFormData, dryRun) {
  for (const targetProfile of _.compact(targetProfiles)) {
    try {
      await knex.transaction(async (trx) => {
        let hasError = false;
        try {
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
            logger.warn(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible déja migré`
            );
            return;
          }
          await _doAutomaticMigration(targetProfile.id, trx);
          if (targetProfile.obsolete) {
            _checkIfTPHasUnexpectedMultiformInstructions(targetProfile.id, multiFormData);
            await _outdate(targetProfile.id, trx);
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible marqué comme obsolète`
            );
            return;
          }
          if (targetProfile.auto) {
            _checkIfTPHasUnexpectedMultiformInstructions(targetProfile.id, multiFormData);
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible migré automatiquement`
            );
            return;
          }
          if (targetProfile.uncap) {
            _checkIfTPHasUnexpectedMultiformInstructions(targetProfile.id, multiFormData);
            await _uncap(targetProfile.id, trx);
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible décappé`
            );
            return;
          }
          if (typeof targetProfile.uniformCap === 'number') {
            _checkIfTPHasUnexpectedMultiformInstructions(targetProfile.id, multiFormData);
            await _uniformCap(targetProfile.id, targetProfile.uniformCap, trx);
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              'Profil cible cappé uniformément à %s',
              targetProfile.uniformCap
            );
            return;
          }
          if (targetProfile.multiformCap) {
            const targetProfileMultiFormData = multiFormData[targetProfile.id];
            if (!targetProfileMultiFormData || targetProfileMultiFormData.length === 0)
              throw new Error('Profil cible cappé multiforme sans instructions');
            await _multiformCap(targetProfile, targetProfileMultiFormData, trx);
            logger.info(
              { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
              `Profil cible cappé multiformément`
            );
            return;
          }
          throw new Error('Aucune action définie pour le profil cible');
        } catch (e) {
          hasError = true;
          if (dryRun) report.push(`${targetProfile.id} - ${targetProfile.name} : ${e.message}`);
          throw e;
        } finally {
          if (dryRun && !hasError) throw new Error('dryrun'); // eslint-disable-line no-unsafe-finally
        }
      });
    } catch (e) {
      logger.error(
        { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
        "Erreur lors de la migration d'un profil cible: %s",
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
  return autoMigrateTargetProfile(id, trx);
}

async function _outdate(id, trx) {
  await trx('target-profiles').update({ outdated: true }).where({ id });
}

async function _uncap(id, trx) {
  await trx('target-profiles').update({ migration_status: 'UNCAP' }).where({ id });
  await trx('target-profile_tubes').update({ level: 8 }).where({ targetProfileId: id });
}

async function _uniformCap(id, cap, trx) {
  await trx('target-profiles').update({ migration_status: 'UNIFORM_CAP' }).where({ id });
  await trx('target-profile_tubes').update({ level: cap }).where({ targetProfileId: id });
}

async function _multiformCap(targetProfile, instructions, trx) {
  const nonExistentTubes = instructions.filter(
    ({ normalizedName }) => !allTubes.find((tube) => tube.normalizedName === normalizedName)
  );
  if (nonExistentTubes.length > 0)
    throw new Error(`Les sujets suivants n'existent pas : ${nonExistentTubes.map(({ name }) => name)}`);
  const fullInstructions = instructions.map(({ name, normalizedName, level }) => {
    const id = allTubes.find((tube) => tube.normalizedName === normalizedName).id;
    return { id, name, level };
  });
  const tubeIds = fullInstructions.map(({ id }) => id);
  const targetProfileTubeIds = await trx('target-profile_tubes')
    .pluck('tubeId')
    .where({ targetProfileId: targetProfile.id });
  const tubeIdsInTpNotInInstructions = targetProfileTubeIds.filter((id) => !tubeIds.includes(id));
  const tubeIdsInInstructionNotInTp = tubeIds.filter((id) => !targetProfileTubeIds.includes(id));
  if (tubeIdsInTpNotInInstructions.length > 0 && targetProfile.id !== 1774) {
    const errorTubeNames = tubeIdsInTpNotInInstructions.map((id) => allTubes.find((tube) => tube.id === id).name);
    throw new Error(
      `Les sujets suivants sont présents dans le profil cible mais pas dans les instructions : ${errorTubeNames}`
    );
  }
  if (tubeIdsInInstructionNotInTp.length > 0) {
    const errorTubeNames = tubeIdsInInstructionNotInTp.map((id) => allTubes.find((tube) => tube.id === id).name);
    throw new Error(
      `Les sujets suivants sont présents dans les instructions mais pas dans le profil cible : ${errorTubeNames}`
    );
  }
  for (const { id, level, name } of fullInstructions) {
    const levelAsNumber = parseInt(level);
    if (isNaN(levelAsNumber) || levelAsNumber >= 8 || levelAsNumber < 1)
      throw new Error(`Le niveau pour le sujet ${name} est invalide : "${level}"`);
    await trx('target-profiles').update({ migration_status: 'MULTIFORM_CAP' }).where({ id: targetProfile.id });
    await trx('target-profile_tubes').update({ level }).where({ targetProfileId: targetProfile.id, tubeId: id });
  }
}

function _checkIfTPHasUnexpectedMultiformInstructions(id, multiFormData) {
  if (multiFormData[id]?.length > 0)
    throw new Error(`Une feuille d'instructions "multiforme" existe pour ce profil cible.`);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const [, , mainFile, ...multiFormFiles] = process.argv;
  const dryRun = process.env.DRY_RUN === 'true';
  await doJob(mainFile, multiFormFiles, dryRun);
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
