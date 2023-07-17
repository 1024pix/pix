import * as dotenv from 'dotenv';

import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: `${__dirname}/../.env` });

import fs from 'fs';
import bluebird from 'bluebird';
import lodash from 'lodash';
const { isEmpty } = lodash;
import { logger } from '../../lib/infrastructure/logger.js';
import { usecases } from '../../lib/domain/usecases/index.js';
import { temporaryStorage } from '../../lib/infrastructure/temporary-storage/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

/**
 * Avant de lancer le script, remplacer la variable DATABASE_URL par l'url de la base de réplication
 * Usage: NODE_TLS_REJECT_UNAUTHORIZED='0' PGSSLMODE=require node scripts/certification/generate-certification-csv-results-by-session-ids.js 1234,5678,9012
 */
async function main() {
  logger.info('Début du script de génération de résultats pour une session.');

  if (process.argv.length <= 2) {
    logger.info(
      'Usage: NODE_TLS_REJECT_UNAUTHORIZED="0" PGSSLMODE=require node scripts/generate-certification-csv-results-by-session-ids.js 1234,5678,9012',
    );
    return;
  }

  const sessionIds = process.argv[2].split(',');

  await bluebird.mapSeries(sessionIds, async (sessionId) => {
    const { session, certificationResults } = await usecases.getSessionResults({ sessionId });

    if (isEmpty(certificationResults)) {
      logger.error(`Pas de résultat trouvé pour la session ${sessionId}`);
      return;
    }

    const csvResult = await usecases.getSessionCertificationResultsCsv({
      session,
      certificationResults,
    });

    logger.info(`Génération de "resultats-session-${sessionId}.csv".`);

    await fs.promises.writeFile(`resultats-session-${sessionId}.csv`, csvResult);
  });

  logger.info('Fin du script.');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await _disconnect();
    }
  }
})();

async function _disconnect() {
  logger.info('Closing connexions to PG...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await temporaryStorage.quit();
  logger.info('Exiting process gracefully...');
}
