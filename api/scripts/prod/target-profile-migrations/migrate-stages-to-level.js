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

import * as targetProfileForAdminRepository from '../../../lib/infrastructure/repositories/target-profile-for-admin-repository.js';
import * as skillRepository from '../../../lib/infrastructure/repositories/skill-repository.js';
import * as organizationRepository from '../../../lib/infrastructure/repositories/organization-repository.js';

const modulePath = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

export async function migrateStagesToLevel(inputFile) {
  const buf = await readFile(inputFile);
  const targetProfileIds = JSON.parse(buf.toString());

  const migrations = await Promise.all(
    targetProfileIds.map(async (targetProfileId) => {
      const targetProfile = await targetProfileForAdminRepository.get({ id: targetProfileId });

      const levels = await _computeLevels(targetProfile.cappedTubes);

      const stagesWOLevel = _getStagesWOLevel(targetProfile.stageCollection.stages);

      const stagesMigrations = _computeStagesMigrations(stagesWOLevel, levels);

      return {
        targetProfileId,
        targetProfileName: targetProfile.name,
        ownerOrganizationId: targetProfile.ownerOrganizationId,
        stagesMigrations,
        ok: _checkAllStagesHaveLevels(stagesMigrations) && _checkStagesHaveDifferentLevels(stagesMigrations),
        levels,
      };
    })
  );

  const organizations = await Promise.all(
    fp.flow(fp.map('ownerOrganizationId'), fp.compact, fp.uniq, fp.map(organizationRepository.get))(migrations)
  );
  const organizationsNameById = Object.fromEntries(
    organizations.map((organization) => [organization.id, organization.name])
  );

  await _writeReport(migrations, organizationsNameById);
}

async function _computeLevels(cappedTubes) {
  const cappedTubesSkills = await Promise.all(
    cappedTubes.map(async (cappedTube) => {
      const skills = await skillRepository.findActiveByTubeId(cappedTube.id);
      return skills.filter((skill) => skill.difficulty <= cappedTube.level);
    })
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
            maxThreshold: 100.00000000000001,
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
      [{ level: 0, threshold: 0, minThreshold: 0, maxThreshold: Number.MIN_VALUE, count: 0 }]
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
      ({ minThreshold, maxThreshold }) => stage.threshold >= minThreshold && stage.threshold <= maxThreshold
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

async function _writeReport(migrations, organizationsNameById) {
  const wb = xlsxUtils.book_new();

  const mainWS = xlsxUtils.aoa_to_sheet([
    ['ID profil cible', 'Nom', 'Organisation de référence', 'Statut'],
    ...migrations.map(({ targetProfileId, targetProfileName, ownerOrganizationId, ok }) => [
      targetProfileId,
      targetProfileName,
      organizationsNameById[ownerOrganizationId],
      ok ? 'OK' : 'KO',
    ]),
  ]);
  xlsxUtils.book_append_sheet(wb, mainWS, 'Résumé');

  for (const { targetProfileId, stagesMigrations, levels } of migrations) {
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
    xlsxUtils.book_append_sheet(wb, ws, `${targetProfileId}`);
  }

  const buf = writeXLSX(wb, { compression: true, type: 'buffer' });
  await writeFile(resolve(dirname(modulePath), 'stages-migration.xlsx'), buf);
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${modulePath} has started`);
  const inputFile = resolve(process.cwd(), process.argv[2]);
  await migrateStagesToLevel(inputFile);
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
