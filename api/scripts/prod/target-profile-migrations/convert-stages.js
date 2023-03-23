require('dotenv').config({
  path: `${__dirname}/../../../.env`,
});
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const { cache } = require('../../../lib/infrastructure/caches/learning-content-cache');
const { disconnect, knex } = require('../../../db/knex-database-connection');

const report = [];

async function doJob(multiFormFiles, dryRun) {
  const targetProfiles = Object.entries(
    multiFormFiles
      .flatMap((multiFormFile) => parseMultiformFileStage(multiFormFile))
      .reduce((acc, data) => ({ ...acc, ...data }))
  )
    .map(([id, stages]) => ({
      id: parseInt(id),
      stages,
    }))
    .filter((targetProfile) => targetProfile.stages.length > 0);
  await checkMax(targetProfiles);

  if (dryRun) printReport();
}

function printReport() {
  console.log(`\n\n\n\n${report.join('\n')}`);
}

function parseMultiformFileStage(file) {
  const workbook = XLSX.readFile(file);

  return Object.fromEntries(
    Object.entries(workbook.Sheets).map(([tab, sheet]) => {
      const rowValues = XLSX.utils.sheet_to_json(sheet, { header: ['stage', 'level'], range: 1 });
      // Find index where we can find the "Palier" header in file
      let stageStartIndex = 0;
      for (stageStartIndex; stageStartIndex < rowValues.length; ++stageStartIndex) {
        const { stage } = rowValues[stageStartIndex];
        if (stage === 'Palier') {
          stageStartIndex = stageStartIndex + 1;
          break;
        }
      }
      if (stageStartIndex >= rowValues.length) return [tab, []];
      const stageRows = rowValues.slice(stageStartIndex);
      if (!containsOnlyLevelStages(stageRows)) return [tab, []];
      return [tab, stageRows];
    })
  );
}

function containsOnlyLevelStages(stageRows) {
  const levelStageRows = stageRows.filter(
    ({ stage, level }) =>
      typeof stage === 'number' &&
      stage >= 0 &&
      stage <= 8 &&
      Number.isInteger(stage) &&
      typeof level === 'number' &&
      level >= 0 &&
      level <= 8 &&
      Number.isInteger(level)
  );
  return levelStageRows.length === stageRows.length;
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const [, , ...multiFormFiles] = process.argv;
  const dryRun = process.env.DRY_RUN === 'true';
  await doJob(multiFormFiles, dryRun);
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

async function checkMax(targetProfiles) {
  const maxCappedTubePerTargetProfileId = await _findMaxCappedTubePerTargetProfileId();
  const countStagePerTargetProfileId = await _findCountStagePerTargetProfileId();
  targetProfiles.forEach((targetProfile) => {
    const maxStageLevel = extractMaxLevelOfStages(targetProfile.stages);
    const maxTubeLevel = maxCappedTubePerTargetProfileId.find(
      ({ targetProfileId }) => targetProfileId === targetProfile.id
    ).max;
    const numberOfStages =
      countStagePerTargetProfileId.find(({ targetProfileId }) => targetProfileId === targetProfile.id)?.count || 0;

    if (numberOfStages !== targetProfile.stages.length) {
      logger.error(
        `Erreur: PC ${targetProfile.id} : ${targetProfile.stages.length} paliers dans le fichier, différent du nombre de paliers du PC en base ${numberOfStages} (sans compter le palier 0)`
      );
    }

    if (maxStageLevel === 8) {
      const realMaxStageLevel = maxTubeLevel - 1;
      if (realMaxStageLevel < 0) {
        logger.error(`Erreur: PC ${targetProfile.id} : Niveau max du PC : 0, impossibler d'ajouter plus de paliers`);
      }
      if (targetProfile.stages.find(({ level }) => level === realMaxStageLevel)) {
        logger.error(
          `Erreur: PC ${targetProfile.id} : Conversion du palier "8" vers le palier ${realMaxStageLevel} impossible car duplication`
        );
      }
    } else {
      if (maxStageLevel > maxTubeLevel) {
        logger.error(
          `Erreur: PC ${targetProfile.id} : Niveau max palier ${maxStageLevel} excède Niveau max PC ${maxTubeLevel}`
        );
      }
      if (maxTubeLevel === maxStageLevel) {
        logger.warn(`Alerte: PC ${targetProfile.id} : Niveau max palier ${maxStageLevel} correspond à un palier 100%`);
      }
    }
  });
}

function extractMaxLevelOfStages(stages) {
  let maxLevel = 0;
  for (const stage of stages) {
    if (stage.level > maxLevel) {
      maxLevel = stage.level;
    }
  }
  return maxLevel;
}

async function _findMaxCappedTubePerTargetProfileId() {
  return knex('target-profile_tubes').select('targetProfileId').max('level').groupBy('targetProfileId');
}

async function _findCountStagePerTargetProfileId() {
  return knex('stages').select('targetProfileId').count('id').where('threshold', '!=', 0).groupBy('targetProfileId');
}

module.exports = { doJob };
