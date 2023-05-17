require('dotenv').config({
  path: `${__dirname}/../../../.env`,
});
const { resolve } = require('path');
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const { writeFile } = require('fs/promises');

async function doJob(multiFormFiles) {
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

  const targetProfileIds = targetProfiles.map(({ id }) => id);

  const outputFile = resolve(__dirname, 'need-stages-migration.json');
  await writeFile(resolve(__dirname, 'need-stages-migration.json'), JSON.stringify(targetProfileIds, null, 2));

  logger.info(`Wrote ${outputFile}`);
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
  const [, , ...files] = process.argv;
  await doJob(files);
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
    }
  }
})();

module.exports = { doJob };
