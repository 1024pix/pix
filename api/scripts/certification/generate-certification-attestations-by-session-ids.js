'use strict';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import bluebird from 'bluebird';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';
import logger from '../../lib/infrastructure/logger';
import certificateRepository from '../../lib/infrastructure/repositories/certificate-repository';
import certificationCourseRepository from '../../lib/infrastructure/repositories/certification-course-repository';
import certificationAttestationPdf from '../../lib/infrastructure/utils/pdf/certification-attestation-pdf';
import { NotFoundError } from '../../lib/domain/errors';
import cache from '../../lib/infrastructure/caches/learning-content-cache';
import { disconnect } from '../../db/knex-database-connection';

/**
 * Avant de lancer le script, remplacer la variable DATABASE_URL par l'url de la base de réplication
 * Usage: LOG_LEVEL=info NODE_TLS_REJECT_UNAUTHORIZED='0' PGSSLMODE=require node scripts/certification/generate-certification-attestations-by-session-ids.js 86781
 */
async function main() {
  logger.info("Début du script de génération d'attestations pour une session.");

  if (process.argv.length <= 2) {
    logger.info(
      'Usage: NODE_TLS_REJECT_UNAUTHORIZED="0" PGSSLMODE=require node scripts/generate-certification-attestations-by-session-id.js 1234,5678,9012'
    );
    return;
  }

  const sessionIds = process.argv[2].split(',');

  await bluebird.mapSeries(sessionIds, async (sessionId) => {
    const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId });

    if (isEmpty(certificationCourses)) {
      logger.error(`Pas de certifications trouvées pour la session ${sessionId}.`);
      return;
    }

    const certificationAttestations = compact(
      await bluebird.mapSeries(certificationCourses, async (certificationCourse) => {
        try {
          return await certificateRepository.getCertificationAttestation(certificationCourse.getId());
        } catch (error) {
          if (!(error instanceof NotFoundError)) {
            throw error;
          }
        }
      })
    );

    if (isEmpty(certificationAttestations)) {
      logger.error(`Pas d'attestation trouvée pour la session ${sessionId}.`);
      return;
    }

    logger.info(`${certificationAttestations.length} attestations récupérées pour la session ${sessionId}.`);

    const { buffer } = await certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
      certificates: certificationAttestations,
    });

    const filename = `attestation-pix-session-${sessionId}.pdf`;
    logger.info(`Génération du fichier pdf ${filename}.`);

    await fs.promises.writeFile(filename, buffer);
  });

  logger.info('Fin du script.');
}

(async () => {
  if (require.main === module) {
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
