require('dotenv').config();
import * as url from 'url';
import { performance } from 'perf_hooks';
import logger from '../../lib/infrastructure/logger';
import cache from '../../lib/infrastructure/caches/learning-content-cache';
import { knex, disconnect } from '../../db/knex-database-connection';
import DatabaseBuilder from '../../db/database-builder/database-builder';

const __filename = url.fileURLToPath(import.meta.url);

const TARGET_PROFILE_ID_TO_OUTDATE = 2001;
const TARGET_PROFILE_ID_AUTO = 2002;
const TARGET_PROFILE_ID_UNCAP = 2003;
const TARGET_PROFILE_ID_UNIFORM_CAP = 2004;
const TARGET_PROFILE_ID_MULTIFORM_CAP = 2005;

const tubeIdCodageEmblématique = 'recJJVWsUD0A4g7bf'; // eslint-disable-line no-unused-vars
const skillIdsCodageEmblématique = {
  3: 'recXO3Ei4vf25mJE7',
  4: 'recVfp1idTGE727dl',
  5: 'rec3wTu36JBVMu70s',
  6: 'recqUtUE0mrjZYmcI',
  7: 'recCQPm1mgdexw3jV',
};
const tubeIdTerminal = 'rec1ahEQ4rwrml6Lo'; // eslint-disable-line no-unused-vars
const skillIdsTerminal = {
  3: 'recNXnzzW5yvqQlA',
  4: 'rec2Qat2a1iwKpqR2',
  5: 'rec145HIb1bvzOuod',
};
const tubeIdEditerDocEnLigne = 'reciWLZDyQmXNn6lc'; // eslint-disable-line no-unused-vars
const skillIdsEditerDocEnLigne = {
  1: 'recXDYAkqqIDCDePc',
  4: 'recwOLZ8bzMQK9NF9',
};
const tubeIdPartageDroits = 'recd3rYCdpWLtHXLk'; // eslint-disable-line no-unused-vars
const skillIdsPartageDroits = {
  2: 'rec7EvARki1b9t574',
  4: 'recqSPZiRJYzfCDaS',
  5: 'recp7rTXpecbxjE5d',
  6: 'recIyRA2zdCdlX6UD',
};
const allSkillIds = [
  ...Object.values(skillIdsCodageEmblématique),
  ...Object.values(skillIdsTerminal),
  ...Object.values(skillIdsEditerDocEnLigne),
  ...Object.values(skillIdsPartageDroits),
];

const doSomething = async () => {
  console.log('doSomething');

  const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: false });

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

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await doSomething();
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

export default { doSomething };
