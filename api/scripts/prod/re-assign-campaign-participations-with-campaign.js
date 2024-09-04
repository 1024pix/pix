import { readFile } from 'node:fs/promises';
import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

export const fillCampaignIdInPartipations = async (object) => {
  const totalCampaignParticipations = Object.keys(object).length;
  logger.info(`${totalCampaignParticipations} campaign participations vont être mises a jour`);
  const trx = await knex.transaction();
  try {
    let i = 0;
    for (const key in object) {
      const campaignId = object[key];
      const campaignParticipationId = key;
      await trx('campaign-participations')
        .update({ campaignId })
        .where({ id: campaignParticipationId })
        .whereNull('campaignId');
      i++;
      logger.info(`Mise a jour de la participation ${i}/${totalCampaignParticipations}`);
    }
    await trx.commit();
    logger.info(`Toutes les campaign-participations ont bien été mises à jour ✅`);
  } catch (error) {
    await trx.rollback();
    logger.info("Aucune participation n'a été mise a jour, une erreur est survenue");
    logger.info(error);
  }
};

async function main() {
  const filePath = process.argv[2];
  logger.info(
    `Début du script pour remettre les campaignId dans les campaign-participations contenues dans le fichier '${filePath}'`,
  );
  const jsonFile = await readFile(filePath);

  const parsedFile = JSON.parse(jsonFile);

  await fillCampaignIdInPartipations(parsedFile);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
