import 'dotenv/config';

import path from 'node:path';
import * as url from 'node:url';

import i18n from 'i18n';

import * as mailService from '../../lib/domain/services/mail-service.js';
import { manageEmails } from '../../lib/domain/services/session-publication-service.js';
import * as certificationCenterRepository from '../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as sharedSessionRepository from '../../src/certification/shared/infrastructure/repositories/session-repository.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { executeScript } from '../tooling/tooling.js';

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

  for (const sessionId of sessionIds) {
    let session;

    try {
      session = await sharedSessionRepository.getWithCertificationCandidates({ id: parseInt(sessionId) });
    } catch (e) {
      logger.error({ e });
      continue;
    }

    if (!session.isPublished()) {
      logger.error(`La session ${sessionId} n'est pas publiée`);
      continue;
    }

    const publishedAt = session.publishedAt;

    try {
      await manageEmails({
        i18n,
        session,
        publishedAt,
        certificationCenterRepository,
        sharedSessionRepository,
        dependencies: { mailService },
      });

      successes++;
    } catch (e) {
      logger.error(e);
    }
  }

  logger.info(`Nombre de session traitées: ${successes}/${sessionIds.length}`);
  logger.info('Fin du script.');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();
