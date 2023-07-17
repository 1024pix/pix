import dotenv from 'dotenv';

dotenv.config();

import bluebird from 'bluebird';
import { logger } from '../../lib/infrastructure/logger.js';
import * as sessionRepository from '../../lib/infrastructure/repositories/sessions/session-repository.js';
import * as certificationCenterRepository from '../../lib/infrastructure/repositories/certification-center-repository.js';
import * as mailService from '../../lib/domain/services/mail-service.js';
import { manageEmails } from '../../lib/domain/services/session-publication-service.js';
import { disconnect } from '../../db/knex-database-connection.js';
import * as url from 'url';
import path from 'path';
import i18n from 'i18n';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Usage: LOG_LEVEL=info NODE_TLS_REJECT_UNAUTHORIZED='0' PGSSLMODE=require node scripts/certification/send-certification-result-emails.js 1234,5678,9012
 */
async function main() {
  logger.info("Début du script d'envoi d'email de resultats de certification pour une liste de session.");

  if (process.argv.length <= 2) {
    logger.info(
      'Usage: NODE_TLS_REJECT_UNAUTHORIZED="0" PGSSLMODE=require node scripts/certification/send-certification-result-emails.js 1234,5678,9012',
    );
    return;
  }

  const directory = path.resolve(path.join(__dirname, '../../translations'));
  i18n.configure({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    directory,
    objectNotation: true,
    updateFiles: false,
  });

  const sessionIds = process.argv[2].split(',');
  let successes = 0;

  await bluebird.mapSeries(sessionIds, async (sessionId) => {
    let session;

    try {
      session = await sessionRepository.getWithCertificationCandidates(parseInt(sessionId));
    } catch (e) {
      logger.error({ e });
      return;
    }

    if (!session.isPublished()) {
      logger.error(`La session ${sessionId} n'est pas publiée`);
      return;
    }

    const publishedAt = session.publishedAt;

    try {
      await manageEmails({
        i18n,
        session,
        publishedAt,
        certificationCenterRepository,
        sessionRepository,
        dependencies: { mailService },
      });

      successes++;
    } catch (e) {
      logger.error(e);
    }
  });

  logger.info(`Nombre de session traitées: ${successes}/${sessionIds.length}`);
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
      await disconnect();
    }
  }
})();
