import dotenv from 'dotenv';
dotenv.config();

import { readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { utils as xlsxUtils, writeXLSX } from 'xlsx';
import fp from 'lodash/fp.js';

import { logger } from '../../../lib/infrastructure/logger.js';
import { learningContentCache as cache } from '../../../lib/infrastructure/caches/learning-content-cache.js';
import { disconnect } from '../../../db/knex-database-connection.js';

import * as targetProfileForAdminRepository from '../../../src/shared/infrastructure/repositories/target-profile-for-admin-repository.js';
import * as skillRepository from '../../../lib/infrastructure/repositories/skill-repository.js';
import * as organizationRepository from '../../../lib/infrastructure/repositories/organization-repository.js';
import * as stageCollectionRepository from '../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';

const modulePath = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

export async function migrateStagesToLevel(inputFile, dryRun) {
  const migrations = await _computeMigrations(inputFile);

  if (!dryRun) {
    await _performMigrations(migrations);
  }

  await _writeReport(migrations);
}

async function _computeMigrations(inputFile) {
  const buf = await readFile(inputFile);
  const targetProfileIds = JSON.parse(buf.toString());

  return Promise.all(
    targetProfileIds.map(async (targetProfileId) => {
      const targetProfile = await targetProfileForAdminRepository.get({ id: targetProfileId });

      const levels = await _computeLevels(targetProfile.cappedTubes);

      const stagesWOLevel = _getStagesWOLevel(targetProfile.stageCollection.stages);

      const stagesMigrations = _computeStagesMigrations(stagesWOLevel, levels);

      return {
        targetProfile,
        stagesMigrations,
        prechecksOk: _checkAllStagesHaveLevels(stagesMigrations) && _checkStagesHaveDifferentLevels(stagesMigrations),
        levels,
      };
    }),
  );
}

async function _computeLevels(cappedTubes) {
  const cappedTubesSkills = await Promise.all(
    cappedTubes.map(async (cappedTube) => {
      const skills = await skillRepository.findActiveByTubeId(cappedTube.id);
      return skills.filter((skill) => skill.difficulty <= cappedTube.level);
    }),
  );

  const skills = cappedTubesSkills.flat();
  const nbSkills = skills.length;

  return fp.flow([
    fp.countBy('difficulty'),
    fp.entries,
    fp.map(([sLevel, count]) => ({ level: +sLevel, count })),
    fp.sortBy('level'),
    fp.transform(
      (levels, level) => {
        const prevLevel = levels.at(-1);
        const count = prevLevel.count + level.count;

        if (count === nbSkills) {
          prevLevel.maxThreshold = 100;
          levels.push({
            ...level,
            count,
            threshold: 100,
            minThreshold: 100,
            maxThreshold: 100.1,
          });
          return;
        }

        const threshold = (count / nbSkills) * 100;
        const minThreshold =
          prevLevel.level === 0 ? Number.MIN_VALUE : (threshold - prevLevel.threshold) / 2 + prevLevel.threshold;
        prevLevel.maxThreshold = minThreshold;

        levels.push({
          ...level,
          count,
          threshold,
          minThreshold,
        });
      },
      [{ level: 0, threshold: 0, minThreshold: 0, maxThreshold: 0.1, count: 0 }],
    ),
  ])(skills);
}

function _getStagesWOLevel(stages) {
  return stages
    .filter(({ isFirstSkill, level }) => !isFirstSkill && level == null)
    .sort(({ threshold: t1 }, { threshold: t2 }) => t1 - t2);
}

function _computeStagesMigrations(stages, levels) {
  return stages.map((stage) => {
    const level = levels.find(
      ({ minThreshold, maxThreshold }) => stage.threshold >= minThreshold && stage.threshold < maxThreshold,
    );
    return {
      stageId: stage.id,
      threshold: stage.threshold,
      level: level?.level,
    };
  });
}

function _checkAllStagesHaveLevels(stagesMigrations) {
  return stagesMigrations.every(({ level }) => level != null) ?? true;
}

function _checkStagesHaveDifferentLevels(stagesMigrations) {
  return fp.flow([fp.countBy('level'), fp.every((count) => count === 1)])(stagesMigrations);
}

async function _performMigrations(migrations) {
  for (const migration of migrations) {
    if (!migration.prechecksOk) continue;

    await _performMigration(migration);
  }
}

async function _performMigration({ targetProfile, stagesMigrations }) {
  const stageCollection = targetProfile.stageCollection;

  const stagesToUpdate = stagesMigrations.map(({ stageId, level }) => {
    const stage = stageCollection.stages.find(({ id }) => id === stageId);

    stage.level = level;
    stage.threshold = null;

    return stage;
  });

  await stageCollectionRepository.update({
    stagesToUpdate,
    stagesToCreate: [],
    stageIdsToDelete: [],
  });
}

async function _writeReport(migrations) {
  const organizations = await Promise.all(
    fp.flow(
      fp.map('targetProfile.ownerOrganizationId'),
      fp.compact,
      fp.uniq,
      fp.map(organizationRepository.get),
    )(migrations),
  );
  const organizationsNameById = Object.fromEntries(
    organizations.map((organization) => [organization.id, organization.name]),
  );

  const wb = xlsxUtils.book_new();

  const mainWS = xlsxUtils.aoa_to_sheet([
    ['ID profil cible', 'Nom', 'Organisation de référence', 'Pré-vérifications'],
    ...migrations.map(({ targetProfile, prechecksOk }) => [
      targetProfile.id,
      targetProfile.name,
      organizationsNameById[targetProfile.ownerOrganizationId],
      prechecksOk ? 'OK' : 'KO',
    ]),
  ]);
  xlsxUtils.book_append_sheet(wb, mainWS, 'Résumé');

  for (const { targetProfile, stagesMigrations, levels } of migrations) {
    const ws = xlsxUtils.aoa_to_sheet([
      ['ID palier', 'Seuil', 'Niveau'],
      ...stagesMigrations.map(({ stageId, threshold, level }) => [stageId, threshold, level]),
      [],
      ['Seuil théorique', 'Seuil min.', 'Seuil max.', 'Niveau'],
      ...levels.map(({ threshold, minThreshold, maxThreshold, level }) => [
        threshold,
        minThreshold,
        maxThreshold,
        level,
      ]),
    ]);
    xlsxUtils.book_append_sheet(wb, ws, `${targetProfile.id}`);
  }

  const buf = writeXLSX(wb, { compression: true, type: 'buffer' });
  await writeFile(resolve(dirname(modulePath), 'stages-migration.xlsx'), buf);
}

async function main() {
  const startTime = performance.now();
  const dryRun = process.env.DRY_RUN !== 'false';
  logger.info({ dryRun }, `Script ${modulePath} has started`);
  const inputFile = resolve(process.cwd(), process.argv[2]);
  await migrateStagesToLevel(inputFile, dryRun);
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
