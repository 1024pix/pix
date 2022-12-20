require('dotenv').config({ path: `${__dirname}/../../../.env` });
const _ = require('lodash');
const { performance } = require('perf_hooks');
const XLSX = require('xlsx');
const logger = require('../../../lib/infrastructure/logger');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const DatabaseBuilder = require('../../../db/database-builder/database-builder');

const TARGET_PROFILE_ID_TO_OUTDATE = 2001;
const TARGET_PROFILE_ID_AUTO = 2002;
const TARGET_PROFILE_ID_UNCAP = 2003;
const TARGET_PROFILE_ID_UNIFORM_CAP = 2004;
const TARGET_PROFILE_ID_MULTIFORM_CAP = 2005;

const tubeIdCodageEmblematique = 'recJJVWsUD0A4g7bf';
const skillIdsCodageEmblematique = {
  3: 'recXO3Ei4vf25mJE7',
  4: 'recVfp1idTGE727dl',
  5: 'rec3wTu36JBVMu70s',
  6: 'recqUtUE0mrjZYmcI',
  7: 'recCQPm1mgdexw3jV',
};
const tubeIdTerminal = 'rec1ahEQ4rwrml6Lo';
const skillIdsTerminal = {
  3: 'recNXnzzW5yvqQlA',
  4: 'rec2Qat2a1iwKpqR2',
  5: 'rec145HIb1bvzOuod',
};
const tubeIdEditerDocEnLigne = 'reciWLZDyQmXNn6lc';
const skillIdsEditerDocEnLigne = {
  1: 'recXDYAkqqIDCDePc',
  4: 'recwOLZ8bzMQK9NF9',
};
const tubeIdPartageDroits = 'recd3rYCdpWLtHXLk';
const skillIdsPartageDroits = {
  2: 'rec7EvARki1b9t574',
  4: 'recqSPZiRJYzfCDaS',
  5: 'recp7rTXpecbxjE5d',
  6: 'recIyRA2zdCdlX6UD',
};
const allSkillIds = [
  ...Object.values(skillIdsCodageEmblematique),
  ...Object.values(skillIdsTerminal),
  ...Object.values(skillIdsEditerDocEnLigne),
  ...Object.values(skillIdsPartageDroits),
];

let allSkills;
let allTubes;
async function _cacheLearningContentData() {
  const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
  allSkills = await skillRepository.list();
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  allTubes = await tubeRepository.list();
}

const prepareData = async () => {
  await _cacheLearningContentData();

  const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: true });

  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ID_TO_OUTDATE,
    name: 'PC à périmer',
  });
  allSkillIds.forEach((skillId) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_ID_TO_OUTDATE,
      skillId,
    })
  );

  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ID_AUTO,
    name: 'PC à migrer automatiquement',
  });
  allSkillIds.forEach((skillId) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_ID_AUTO,
      skillId,
    })
  );

  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ID_UNCAP,
    name: 'PC avec sujets non plafonnés',
  });
  allSkillIds.forEach((skillId) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_ID_UNCAP,
      skillId,
    })
  );

  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ID_UNIFORM_CAP,
    name: 'PC avec sujets plafonnés au même niveau',
  });
  allSkillIds.forEach((skillId) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_ID_UNIFORM_CAP,
      skillId,
    })
  );

  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ID_MULTIFORM_CAP,
    name: 'PC avec sujets plafonnés à différents niveaux',
  });
  allSkillIds.forEach((skillId) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP,
      skillId,
    })
  );

  await databaseBuilder.commit();
};

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
};

async function parseTabsData(file) {
  const workbook = XLSX.readFile(file);

  const tabsData = Object.fromEntries(
    Object.entries(tabs).map(([tab, { sheetToJsonConfig, mapper = (_) => _ }]) => [
      tab,
      XLSX.utils.sheet_to_json(workbook.Sheets[tab], sheetToJsonConfig).map(mapper),
    ])
  );

  return tabsData;
}

function ouiNonToBoolean(s, defaultValue = false) {
  return s?.toLowerCase().trim().startsWith('o') ?? defaultValue;
}

async function migrateTargetProfiles(targetProfiles) {
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
          return;
        }
        if (targetProfile.auto) {
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible migré automatiquement`
          );
          return;
        }
        if (targetProfile.uncap) {
          await _uncap(targetProfile.id, trx);
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible décappé`
          );
          return;
        }
        if (targetProfile.uniformCap != undefined) {
          await _uniformCap(targetProfile.id, targetProfile.uniformCap, trx);
          logger.info(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible cappé uniformément à %s`,
            targetProfile.uniformCap
          );
          return;
        }
        if (targetProfile.multiformCap) {
          logger.error(
            { targetProfileId: targetProfile.id, targetProfileName: targetProfile.name },
            `Profil cible cappé multiforme non traité`,
            targetProfile.uniformCap
          );
        }
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

const checkData = async (report) => {
  if (report['2000'] !== "2000: PC n'existe pas") console.log('PC 2000 KO');
  await _checkTP2001();
  await _checkTP2002();
  await _checkTP2003();
  await _checkTP2004();
  await _checkTP2005();
};

async function _checkTP2001() {
  const EXPECTED_TUBES_AUTO = {
    [tubeIdCodageEmblematique]: 7,
    [tubeIdTerminal]: 5,
    [tubeIdEditerDocEnLigne]: 4,
    [tubeIdPartageDroits]: 6,
  };
  const { outdated } = await knex('target-profiles')
    .select('outdated')
    .where({ id: TARGET_PROFILE_ID_TO_OUTDATE })
    .first();
  if (outdated === false) console.log('PC 2001 KO');
  const targetProfileTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId: TARGET_PROFILE_ID_TO_OUTDATE })
    .orderBy('tubeId');
  if (targetProfileTubes.length !== 4) console.log('PC 2001 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdCodageEmblematique).level !==
    EXPECTED_TUBES_AUTO[tubeIdCodageEmblematique]
  )
    console.log('PC 2001 KO');
  if (targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdTerminal).level !== EXPECTED_TUBES_AUTO[tubeIdTerminal])
    console.log('PC 2001 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdEditerDocEnLigne).level !==
    EXPECTED_TUBES_AUTO[tubeIdEditerDocEnLigne]
  )
    console.log('PC 2001 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdPartageDroits).level !==
    EXPECTED_TUBES_AUTO[tubeIdPartageDroits]
  )
    console.log('PC 2001 KO');
}

async function _checkTP2002() {
  const EXPECTED_TUBES_AUTO = {
    [tubeIdCodageEmblematique]: 7,
    [tubeIdTerminal]: 5,
    [tubeIdEditerDocEnLigne]: 4,
    [tubeIdPartageDroits]: 6,
  };
  const { outdated } = await knex('target-profiles').select('outdated').where({ id: TARGET_PROFILE_ID_AUTO }).first();
  if (outdated === true) console.log('PC 2002 KO');
  const targetProfileTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId: TARGET_PROFILE_ID_AUTO })
    .orderBy('tubeId');
  if (targetProfileTubes.length !== 4) console.log('PC 2002 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdCodageEmblematique).level !==
    EXPECTED_TUBES_AUTO[tubeIdCodageEmblematique]
  )
    console.log('PC 2002 KO');
  if (targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdTerminal).level !== EXPECTED_TUBES_AUTO[tubeIdTerminal])
    console.log('PC 2002 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdEditerDocEnLigne).level !==
    EXPECTED_TUBES_AUTO[tubeIdEditerDocEnLigne]
  )
    console.log('PC 2002 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdPartageDroits).level !==
    EXPECTED_TUBES_AUTO[tubeIdPartageDroits]
  )
    console.log('PC 2002 KO');
}

async function _checkTP2003() {
  const EXPECTED_TUBES_AUTO = {
    [tubeIdCodageEmblematique]: 8,
    [tubeIdTerminal]: 8,
    [tubeIdEditerDocEnLigne]: 8,
    [tubeIdPartageDroits]: 8,
  };
  const { outdated } = await knex('target-profiles').select('outdated').where({ id: TARGET_PROFILE_ID_UNCAP }).first();
  if (outdated === true) console.log('PC 2003 KO');
  const targetProfileTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId: TARGET_PROFILE_ID_UNCAP })
    .orderBy('tubeId');
  if (targetProfileTubes.length !== 4) console.log('PC 2003 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdCodageEmblematique).level !==
    EXPECTED_TUBES_AUTO[tubeIdCodageEmblematique]
  )
    console.log('PC 2003 KO');
  if (targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdTerminal).level !== EXPECTED_TUBES_AUTO[tubeIdTerminal])
    console.log('PC 2003 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdEditerDocEnLigne).level !==
    EXPECTED_TUBES_AUTO[tubeIdEditerDocEnLigne]
  )
    console.log('PC 2003 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdPartageDroits).level !==
    EXPECTED_TUBES_AUTO[tubeIdPartageDroits]
  )
    console.log('PC 2003 KO');
}

async function _checkTP2004() {
  const EXPECTED_TUBES_AUTO = {
    [tubeIdCodageEmblematique]: 6,
    [tubeIdTerminal]: 6,
    [tubeIdEditerDocEnLigne]: 6,
    [tubeIdPartageDroits]: 6,
  };
  const { outdated } = await knex('target-profiles')
    .select('outdated')
    .where({ id: TARGET_PROFILE_ID_UNIFORM_CAP })
    .first();
  if (outdated === true) console.log('PC 2004 KO');
  const targetProfileTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId: TARGET_PROFILE_ID_UNIFORM_CAP })
    .orderBy('tubeId');
  if (targetProfileTubes.length !== 4) console.log('PC 2004 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdCodageEmblematique).level !==
    EXPECTED_TUBES_AUTO[tubeIdCodageEmblematique]
  )
    console.log('PC 2004 KO');
  if (targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdTerminal).level !== EXPECTED_TUBES_AUTO[tubeIdTerminal])
    console.log('PC 2004 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdEditerDocEnLigne).level !==
    EXPECTED_TUBES_AUTO[tubeIdEditerDocEnLigne]
  )
    console.log('PC 2004 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdPartageDroits).level !==
    EXPECTED_TUBES_AUTO[tubeIdPartageDroits]
  )
    console.log('PC 2004 KO');
}

async function _checkTP2005() {
  const EXPECTED_TUBES_AUTO = {
    [tubeIdCodageEmblematique]: 7,
    [tubeIdTerminal]: 4,
    [tubeIdEditerDocEnLigne]: 2,
    [tubeIdPartageDroits]: 4,
  };
  const { outdated } = await knex('target-profiles')
    .select('outdated')
    .where({ id: TARGET_PROFILE_ID_MULTIFORM_CAP })
    .first();
  if (outdated === true) console.log('PC 2005 KO');
  const targetProfileTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP })
    .orderBy('tubeId');
  if (targetProfileTubes.length !== 4) console.log('PC 2005 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdCodageEmblematique).level !==
    EXPECTED_TUBES_AUTO[tubeIdCodageEmblematique]
  )
    console.log('PC 2005 KO');
  if (targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdTerminal).level !== EXPECTED_TUBES_AUTO[tubeIdTerminal])
    console.log('PC 2005 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdEditerDocEnLigne).level !==
    EXPECTED_TUBES_AUTO[tubeIdEditerDocEnLigne]
  )
    console.log('PC 2005 KO');
  if (
    targetProfileTubes.find(({ tubeId }) => tubeId === tubeIdPartageDroits).level !==
    EXPECTED_TUBES_AUTO[tubeIdPartageDroits]
  )
    console.log('PC 2005 KO');
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await prepareData();
  const file = process.argv[2];
  const tabsData = await parseTabsData(file);
  await migrateTargetProfiles(tabsData['PRO']);
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

module.exports = { prepareData, checkData };
