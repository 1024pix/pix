require('dotenv').config({
  path: `${__dirname}/../../../.env`,
});
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const { cache } = require('../../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const { normalizeAndRemoveAccents } = require('../../../lib/domain/services/validation-treatments');

let allTubes;
async function _cacheLearningContentData() {
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  const tubes = await tubeRepository.list();
  allTubes = tubes.map((tube) => ({ ...tube, normalizedName: normalizeAndRemoveAccents(tube.name) }));
}
const report = [];

async function doJob(file, dryRun) {
  await _cacheLearningContentData();
  const genericData = parseGenericTab(file);
  const criteriaTabsData = parseCriteriaTabs(file);
  try {
    await knex.transaction(async (trx) => {
      await _deleteOldCriteria(genericData['Main'], trx);
      await _createNewCriteria(genericData['Main'], criteriaTabsData, trx, dryRun);

      if (dryRun) {
        console.log(report.join('\n'));
        throw new Error('dryrun');
      }
    });
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

const mapperFnc = (line) => {
  return line;
};

const tabs = {
  Main: {
    sheetToJsonConfig: {
      header: ['ID_RT', 'CRITERION_NAME', 'CRITERION_THRESHOLD', 'TAB_TO_DATA'],
      range: 1,
    },
    mapper: mapperFnc,
  },
};

function parseGenericTab(file) {
  const workbook = XLSX.readFile(file);

  return Object.fromEntries(
    Object.entries(tabs).map(([tab, { sheetToJsonConfig, mapper = (_) => _ }]) => [
      tab,
      XLSX.utils.sheet_to_json(workbook.Sheets[tab], sheetToJsonConfig).map(mapper),
    ])
  );
}

function parseCriteriaTabs(file) {
  const workbook = XLSX.readFile(file);
  const tabsToParse = [
    '2224_809A_50',
    '2224_809B_50',
    '2224_810A_60',
    '2224_810B_60',
    '2264_823A_50',
    '2264_823B_50',
    '2264_824A_60',
    '2264_824B_60',
  ];
  return Object.fromEntries(
    Object.entries(workbook.Sheets).map(([tab, sheet]) => {
      if (!tabsToParse.includes(tab)) return [tab, []];
      const rowValues = XLSX.utils.sheet_to_json(sheet, { header: ['sujet', 'plafond'], range: 2 });
      return [
        tab,
        rowValues.map(({ sujet, plafond }) => ({
          normalizedName: normalizeAndRemoveAccents(sujet),
          name: sujet,
          level: plafond,
        })),
      ];
    })
  );
}

async function _deleteOldCriteria(genericData, trx) {
  for (const badge of genericData) {
    const badgeId = badge['ID_RT'];
    await trx('badge-criteria').where('badgeId', badgeId).delete();
  }
}

async function _createNewCriteria(genericData, criteriaTabsData, trx, dryRun) {
  for (const badgeCriterion of genericData) {
    const badgeId = badgeCriterion['ID_RT'];
    const criterionName = badgeCriterion['CRITERION_NAME'];
    const criterionThreshold = badgeCriterion['CRITERION_THRESHOLD'];
    const tabName = badgeCriterion['TAB_TO_DATA'];
    const tabData = criteriaTabsData[tabName];
    try {
      if (!tabData) {
        report.push(`${badgeId} - ${criterionName}:Pas d'onglet de données trouvé pour le nom d'onglet ${tabName}`);
        throw new Error();
      }
      await _findTubeIds(badgeId, tabData, criterionName);
      await _checkIfCappedTubesAreInTargetProfile(badgeId, tabData, criterionName, trx);
      await _writeCriteriaInDB(badgeId, criterionName, criterionThreshold, tabData, trx);
    } catch (e) {
      if (dryRun) console.log(e);
      else throw e;
    }
  }
}

async function _findTubeIds(badgeId, tabData, criterionName) {
  const nonExistentTubes = [];
  for (const tubeData of tabData) {
    const tubeFromLearningContent = allTubes.find((tube) => tube.normalizedName === tubeData.normalizedName);
    if (tubeData.normalizedName === '@accessibilite') tubeData.id = 'recdd0tt0BaQxeSj5';
    else if (!tubeFromLearningContent) nonExistentTubes.push(tubeData.normalizedName);
    else tubeData.id = tubeFromLearningContent.id;
  }
  if (nonExistentTubes.length > 0) {
    report.push(
      `${badgeId} - ${criterionName}: Tubes non trouvés dans le référentiel : ${nonExistentTubes.join(', ')}`
    );
    throw new Error();
  }
}

async function _checkIfCappedTubesAreInTargetProfile(badgeId, tabData, criterionName, trx) {
  const notInTPTubes = [];
  const exceedLevelTubes = [];
  const tpCappedTubes = await trx('target-profile_tubes')
    .select('tubeId', 'level')
    .join('badges', 'badges.targetProfileId', 'target-profile_tubes.targetProfileId')
    .where('badges.id', badgeId);
  for (const tubeData of tabData) {
    const tpCappedTube = tpCappedTubes.find(({ tubeId }) => tubeId === tubeData.id);
    if (!tpCappedTube) notInTPTubes.push(tubeData.normalizedName);
    else if (tpCappedTube.level < tubeData.level) exceedLevelTubes.push(tubeData.normalizedName);
  }
  if (notInTPTubes.length > 0) {
    report.push(`${badgeId} - ${criterionName}: Tubes non présents dans le PC : ${notInTPTubes.join(', ')}`);
    throw new Error();
  }
  if (exceedLevelTubes.length > 0) {
    report.push(`${badgeId} - ${criterionName}: Le niveau est trop haut : ${notInTPTubes.join(', ')}`);
    throw new Error();
  }
}

async function _writeCriteriaInDB(badgeId, criterionName, criterionThreshold, tabData, trx) {
  const cappedTubes = tabData.map(({ id, level }) => ({ id, level }));
  await trx('badge-criteria').insert({
    scope: 'CappedTubes',
    threshold: criterionThreshold,
    badgeId,
    name: criterionName,
    cappedTubes: JSON.stringify(cappedTubes),
  });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const [, , file] = process.argv;
  const dryRun = process.env.DRY_RUN === 'true';
  await doJob(file, dryRun);
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
