import dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { resolve } from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { readFile, set_fs, utils as xlsxUtils } from 'xlsx';
import fp from 'lodash/fp.js';

import { logger } from '../../../lib/infrastructure/logger.js';
import { learningContentCache as cache } from '../../../lib/infrastructure/caches/learning-content-cache.js';
import { disconnect } from '../../../db/knex-database-connection.js';

import * as targetProfileForAdminRepository from '../../../lib/infrastructure/repositories/target-profile-for-admin-repository.js';
import * as stageCollectionRepository from '../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';

set_fs(fs);

const modulePath = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

export async function revertStagesToThreshold(inputFile, dryRun, sample) {
  const reverts = await _computeReverts(inputFile, sample);

  if (!dryRun) {
    await _performReverts(reverts);
  }
}

async function _computeReverts(inputFile, sample) {
  const wb = readFile(inputFile);

  let targetProfileIds = xlsxUtils
    .sheet_to_json(wb.Sheets['Résumé'], {
      header: ['targetProfileId', undefined, undefined, 'precheck'],
      range: 1,
    })
    .filter(({ precheck }) => precheck === 'OK')
    .map(({ targetProfileId }) => targetProfileId);

  if (sample) {
    targetProfileIds = fp.sampleSize(10, targetProfileIds);
    logger.info({ targetProfileIds }, `Using sample target profiles`);
  }

  const targetProfiles = await Promise.all(targetProfileIds.map((id) => targetProfileForAdminRepository.get({ id })));

  return targetProfiles
    .map((targetProfile) => {
      const stagesWLevel = targetProfile.stageCollection.stages.filter(
        ({ isFirstSkill, level }) => !isFirstSkill && level != null,
      );

      if (stagesWLevel.length === 0) {
        logger.info(`Skipping target profile ${targetProfile.id} which has no stages with level`);
        return null;
      }

      const stageReverts = fp.takeWhile(
        ({ stageId }) => stageId !== 'Seuil théorique',
        xlsxUtils.sheet_to_json(wb.Sheets[targetProfile.id], { header: ['stageId', 'threshold', 'level'], range: 1 }),
      );

      if (stageReverts.length === 0) {
        logger.info(`Skipping target profile ${targetProfile.id} which had no migrations`);
        return null;
      }

      const precheckNoChanges = stageReverts.every(
        ({ stageId, level }) => stagesWLevel.find((stage) => stage.id === stageId)?.level === level,
      );

      const precheckUnknownStage = stagesWLevel.every((stage) =>
        stageReverts.some(({ stageId }) => stageId === stage.id),
      );

      if (!precheckNoChanges || !precheckUnknownStage) {
        logger.error(
          { stageReverts, stagesWLevel },
          `Skipping target profile ${targetProfile.id} which had changes since migration`,
        );
        return null;
      }

      return {
        targetProfile,
        stageReverts,
      };
    })
    .filter((revert) => revert != null);
}

async function _performReverts(reverts) {
  return Promise.all(reverts.map(_performRevert));
}

async function _performRevert({ targetProfile, stageReverts }) {
  const stageCollection = targetProfile.stageCollection;

  const stagesToUpdate = stageReverts.map(({ stageId, threshold }) => {
    const stage = stageCollection.stages.find(({ id }) => id === stageId);

    stage.level = null;
    stage.threshold = threshold;

    return stage;
  });

  await stageCollectionRepository.update({
    stagesToUpdate,
    stagesToCreate: [],
    stageIdsToDelete: [],
  });
}

async function main() {
  const startTime = performance.now();
  const dryRun = process.env.DRY_RUN !== 'false';
  const sample = process.env.SAMPLE === 'true';
  if (!dryRun && sample) throw new Error('SAMPLE=true is not allowed when DRY_RUN=false');
  logger.info({ dryRun, sample }, `Script ${modulePath} has started`);
  const inputFile = resolve(process.cwd(), process.argv[2]);
  await revertStagesToThreshold(inputFile, dryRun, sample);
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
