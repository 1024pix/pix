import 'dotenv/config';

import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

const ComplementaryCertificationUpdateStatus = Object.freeze({
  IDLE: Symbol('IDLE'),
  ERROR: Symbol('ERROR'),
  SUCCESS: Symbol('SUCCESS'),
});

class ComplementaryCertificationCommand {
  constructor({ certificationCourseId }) {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.IDLE;
    this.certificationCourseId = certificationCourseId;
  }

  complementaryBeforeUpdate({
    statusBeforeScript,
    levelBeforeScript,
    labelBeforeScript,
    examinationDateBeforeScript,
    certificationDateBeforeScript,
  }) {
    this.statusBeforeScript = statusBeforeScript;
    this.levelBeforeScript = levelBeforeScript;
    this.labelBeforeScript = labelBeforeScript;
    this.examinationDateBeforeScript = examinationDateBeforeScript;
    this.certificationDateBeforeScript = certificationDateBeforeScript;

    return this;
  }

  complementaryAfterUpdate({
    statusAfterScript,
    levelAfterScript,
    labelAfterScript,
    examinationDateAfterScript,
    certificationDateAfterScript,
  }) {
    this.statusAfterScript = statusAfterScript;
    this.levelAfterScript = levelAfterScript;
    this.labelAfterScript = labelAfterScript;
    this.examinationDateAfterScript = examinationDateAfterScript;
    this.certificationDateAfterScript = certificationDateAfterScript;

    return this;
  }

  updateFailure() {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.ERROR;
  }

  updateSuccessfull() {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.SUCCESS;
  }
}

const _snapshotCurrentScoring = async ({ certificationCourseId }) => {
  return knex('certification-courses')
    .select('certification-courses.id', 'certification-courses.createdAt', 'sessions.publishedAt')
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .where('certification-courses.id', '=', certificationCourseId);
};

/**
 * IMPORTANT
 *
 * This script is a TEMPORARY script, it is not crafter to be re-used in a context outside the one
 * it has been made for
 *
 * IMPORTANT
 *
 * Usage : node scripts/certification/rescore-complementary-certifications.js 111[xxx,yyy,]
 *
 * @returns {number} process exit code
 */
async function main(certificationCourseIds = []) {
  logger.info(`Rescoring ${certificationCourseIds.length} complementary certifications`);

  for (const certificationCourseId of certificationCourseIds) {
    const complementaryRescored = new ComplementaryCertificationCommand({ certificationCourseId });

    try {
      const currentComplementarySnapshot = await _snapshotCurrentScoring({ certificationCourseId });
      complementaryRescored.complementaryBeforeUpdate({
        statusBeforeScript: '',
        levelBeforeScript: '',
        labelBeforeScript: '',
        examinationDateBeforeScript: currentComplementarySnapshot.createdAt,
        certificationDateBeforeScript: currentComplementarySnapshot.publishedAt,
      });
      complementaryRescored.updateSuccessfull();
    } catch (error) {
      logger.error(error, `Could not rescore certificationCourseId:[${complementaryRescored.certificationCourseId}]`);
      complementaryRescored.updateFailure();
    }
  }

  return 0;
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      const certificationCourseIds = process.argv[2]
        .split(',')
        .map((str) => parseInt(str, 10))
        .filter(Number.isInteger);
      const exitCode = await main(certificationCourseIds);
      return exitCode;
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
