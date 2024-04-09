import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { read as readXlsx, utils as xlsxUtils } from 'xlsx';

import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

dotenv.config({
  path: `${__dirname}/../../../.env`,
});

async function doJob(multiFormFiles) {
  const multiFormDatas = await Promise.all(
    multiFormFiles.map((multiFormFile) => parseMultiformFileStage(multiFormFile)),
  );

  const targetProfiles = Object.entries(multiFormDatas.flat().reduce((acc, data) => ({ ...acc, ...data })))
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

async function parseMultiformFileStage(file) {
  const buf = await readFile(file);
  const workbook = readXlsx(buf);

  return Object.fromEntries(
    Object.entries(workbook.Sheets).map(([tab, sheet]) => {
      const rowValues = xlsxUtils.sheet_to_json(sheet, { header: ['stage', 'level'], range: 1 });
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
    }),
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
      Number.isInteger(level),
  );
  return levelStageRows.length === stageRows.length;
}
const modulePath = fileURLToPath(import.meta.url);

const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${modulePath} has started`);
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

export { doJob };
