import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../../../.env`,
});
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { disconnect, knex } from '../../../db/knex-database-connection.js';
import { learningContentCache } from '../../../lib/infrastructure/caches/learning-content-cache.js';
import { logErrorWithCorrelationIds } from '../../../lib/infrastructure/monitoring-tools.js';

async function main() {
  try {
    const { targetProfileId, withBadges } = _getAllArgs();
    console.log(`Récupération du profil cible ${targetProfileId} / ${withBadges ? 'avec' : 'sans'} les RTs`);
    await doJob(targetProfileId, withBadges);
  } catch (err) {
    logErrorWithCorrelationIds(err);
    throw err;
  } finally {
    await disconnect();
    await learningContentCache.quit();
  }
}

function _getAllArgs() {
  const { targetProfileId, withBadges } = yargs(hideBin(process.argv))
    .option('targetProfileId', {
      type: 'number',
      description: 'ID du profil cible',
    })
    .option('withBadges', {
      type: 'boolean',
      description: 'pour récupérer aussi les RTs associés',
    })
    .help().argv;
  if (!targetProfileId) throw new Error('Veuillez renseigner un ID de profil cible');
  return { targetProfileId, withBadges };
}

async function doJob(targetProfileId, withBadges) {
  const targetProfileData = await knex('target-profiles')
    .select('imageUrl', 'description', 'name', 'isSimplifiedAccess', 'category')
    .where({ id: targetProfileId })
    .first();
  printTargetProfileAsSeed(targetProfileData);
  const tubesData = await knex('target-profile_tubes').select('tubeId', 'level').where({ targetProfileId });
  printTargetProfileTubesAsSeed(tubesData);
  if (withBadges) {
    const badgesData = await knex('badges')
      .select('id', 'message', 'altMessage', 'key', 'imageUrl', 'title', 'isCertifiable', 'isAlwaysVisible')
      .where({ targetProfileId });
    let iterator = 0;
    for (const badgeData of badgesData) {
      ++iterator;
      printBadgeAsSeed(badgeData, iterator);
      const badgeCriteriaData = await knex('badge-criteria')
        .select('scope', 'threshold', 'cappedTubes', 'name')
        .where({ badgeId: badgeData.id });
      console.log('\n');
      printBadgeCriteriaAsSeed(badgeCriteriaData, iterator);
      const complementaryCertificationBadgeData = await knex('complementary-certification-badges')
        .select('level', 'imageUrl', 'label', 'certificateMessage', 'temporaryCertificateMessage', 'stickerUrl')
        .where({ badgeId: badgeData.id })
        .first();
      console.log('\n');
      if (complementaryCertificationBadgeData) {
        printComplementaryCertificationBadgeAsSeed(complementaryCertificationBadgeData, iterator);
        console.log('\n');
      }
    }
  }
}

function printTargetProfileAsSeed(targetProfileData) {
  console.log(`
    databaseBuilder.factory.buildTargetProfile({
      id: PUT_TARGET_PROFILE_ID_PLS,
      imageUrl: ${escapedOrNull(targetProfileData.imageUrl)},
      description: ${escapedOrNull(targetProfileData.description)},
      name: ${escapedOrNull(targetProfileData.name)},
      isSimplifiedAccess: ${targetProfileData.isSimplifiedAccess},
      category: ${escapedOrNull(targetProfileData.category)},
      isPublic: true,
    });`);
}

function printTargetProfileTubesAsSeed(tubesData) {
  const print = `[${tubesData
    .map(({ tubeId, level }) => `{ tubeId: \`${tubeId}\`, level: ${level} }`)
    .join(
      ',',
    )}].map(({ tubeId, level }) => { databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: PUT_TARGET_PROFILE_ID_PLS, tubeId, level }); });`;
  console.log(print);
}

function printBadgeAsSeed(badgeData, i) {
  console.log(`
    databaseBuilder.factory.buildBadge({
      id: PUT_BADGE_${i}_ID_PLS,
      targetProfileId: PUT_TARGET_PROFILE_ID_PLS,
      message: ${escapedOrNull(badgeData.message)},
      altMessage: ${escapedOrNull(badgeData.altMessage)},
      imageUrl: ${escapedOrNull(badgeData.imageUrl)},
      key: ${escapedOrNull(badgeData.key)},
      title: ${escapedOrNull(badgeData.title)},
      isCertifiable: ${badgeData.isCertifiable},
      isAlwaysVisible: ${badgeData.isAlwaysVisible},
    });`);
}

function printBadgeCriteriaAsSeed(badgeCriteriaData, i) {
  const print = `[${badgeCriteriaData
    .map(
      ({ scope, threshold, cappedTubes, name }) =>
        `{ scope: \`${scope}\`, threshold: ${threshold}, cappedTubes: ${escapedOrNull(
          JSON.stringify(cappedTubes),
        )}, name: ${escapedOrNull(name)}}`,
    )
    .join(
      ',',
    )}].map(({ scope, threshold, cappedTubes, name }) => { databaseBuilder.factory.buildBadgeCriterion({ badgeId: PUT_BADGE_${i}_ID_PLS, scope, threshold, cappedTubes, name }); });`;
  console.log(print);
}

function printComplementaryCertificationBadgeAsSeed(complementaryCertificationBadgeData, i) {
  console.log(`
    databaseBuilder.factory.buildComplementaryCertificationBadge({
      id: PUT_COMPLEMENTARY_CERTIFICATION_BADGE_${i}_ID_PLS,
      badgeId: PUT_BADGE_${i}_ID_PLS,
      complementaryCertificationId: PUT_COMPLEMENTARY_CERTIFICATION_ID_PLS,
      level: ${complementaryCertificationBadgeData.level},
      imageUrl: ${escapedOrNull(complementaryCertificationBadgeData.imageUrl)},
      label: ${escapedOrNull(complementaryCertificationBadgeData.label)},
      certificateMessage: ${escapedOrNull(complementaryCertificationBadgeData.certificateMessage)},
      temporaryCertificateMessage: ${escapedOrNull(complementaryCertificationBadgeData.temporaryCertificateMessage)},
      stickerUrl: ${escapedOrNull(complementaryCertificationBadgeData.stickerUrl)},
    });`);
}

function escapedOrNull(value) {
  return value === null ? null : `\`${value}\``;
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
if (isLaunchedFromCommandLine) {
  main();
}

export { doJob };
