import 'dotenv/config';

import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { CertificationRescoringCompleted } from '../../lib/domain/events/CertificationRescoringCompleted.js';
import { eventDispatcher } from '../../lib/domain/events/index.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

const ComplementaryCertificationUpdateStatus = Object.freeze({
  IDLE: 'IDLE',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
});

class ComplementaryCertificationCommand {
  constructor({ certificationCourseId }) {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.IDLE;
    this.certificationCourseId = certificationCourseId;
  }

  complementaryBeforeUpdate({
    statusBeforeScript,
    badgeLevelBeforeScript,
    examinationDateBeforeScript,
    certificationDateBeforeScript,
    commentByAutoJuryBeforeScript,
  }) {
    this.statusBeforeScript = statusBeforeScript;
    this.badgeLevelBeforeScript = badgeLevelBeforeScript;
    this.examinationDateBeforeScript = examinationDateBeforeScript;
    this.certificationDateBeforeScript = certificationDateBeforeScript;
    this.commentByAutoJuryBeforeScript = commentByAutoJuryBeforeScript;
  }

  complementaryAfterUpdate({
    statusAfterScript,
    badgeLevelAfterScript,
    examinationDateAfterScript,
    certificationDateAfterScript,
    commentByAutoJuryAfterScript,
  }) {
    this.statusAfterScript = statusAfterScript;
    this.badgeLevelAfterScript = badgeLevelAfterScript;
    this.examinationDateAfterScript = examinationDateAfterScript;
    this.certificationDateAfterScript = certificationDateAfterScript;
    this.commentByAutoJuryAfterScript = commentByAutoJuryAfterScript;
  }

  updateFailure() {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.ERROR;
  }

  updateSuccessfull() {
    this.rescoringStatus = ComplementaryCertificationUpdateStatus.SUCCESS;
  }
}

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {knex} params.knex
 */
const _snapshotCurrentScoring = async ({ certificationCourseId, knex }) => {
  const snapshot = await knex('complementary-certification-courses')
    .select(
      'certification-courses.id',
      'certification-courses.createdAt',
      'sessions.publishedAt',
      'assessment-results.status',
      'assessment-results.commentByAutoJury',
      'complementary-certification-badges.label',
    )
    .innerJoin(
      'certification-courses',
      'complementary-certification-courses.certificationCourseId',
      'certification-courses.id',
    )
    .innerJoin(
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-courses.complementaryCertificationBadgeId',
    )
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses-last-assessment-results.certificationCourseId',
      'certification-courses.id',
    )
    .leftJoin(
      'assessment-results',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
      'assessment-results.id',
    )
    .where('complementary-certification-courses.certificationCourseId', '=', certificationCourseId)
    .first();

  if (!snapshot) {
    throw new Error(`certificationCourseId:[${certificationCourseId}] does not exist`);
  }

  return snapshot;
};

/**
 * @param {Object} params
 * @param {ComplementaryRescoringCommand} params.complementaryRescoringCommand
 * @param {eventDispatcher} params.eventDispatcher
 */
const _rescoreCertification = async ({ complementaryRescoringCommand, eventDispatcher }) => {
  const certificationCourseId = complementaryRescoringCommand.certificationCourseId;
  const status = complementaryRescoringCommand.statusBeforeScript;
  if (status !== 'validated') {
    throw new Error(
      `certificationCourseId:[${certificationCourseId}] is not a 'validated' complementary certification, was:[${status}]`,
    );
  }

  return eventDispatcher.dispatch(new CertificationRescoringCompleted({ certificationCourseId }));
};

/**
 * @param {Object} params
 * @param {Array<ComplementaryCertificationCommand>} params.rescoringResults
 */
const _output = ({ rescoringResults }) => {
  logger.info(JSON.stringify({ rescoring_result: rescoringResults }));
};

/**
 * IMPORTANT
 *
 * This script is a TEMPORARY script, it is not crafter to be re-used in a context outside the one
 * it has been made for
 *
 * IMPORTANT
 *
 * Usage : node scripts/certification/rescore-complementary-certifications.js "111 [,xxx,yyy,...]"
 *
 * @param {Object} params
 * @param {Array<number>} params.certificationCourseIds
 * @param {knex} params.knex
 * @param {eventDispatcher} params.eventDispatcher
 * @param {logger} params.logger
 * @returns {number} process exit code
 */
async function main({ certificationCourseIds = [], knex, eventDispatcher, logger }) {
  logger.info(`Rescoring ${certificationCourseIds.length} complementary certifications`);

  const rescoringResults = [];
  for (const certificationCourseId of certificationCourseIds) {
    const complementaryRescoringCommand = new ComplementaryCertificationCommand({ certificationCourseId });

    try {
      const currentComplementarySnapshot = await _snapshotCurrentScoring({ certificationCourseId, knex });
      complementaryRescoringCommand.complementaryBeforeUpdate({
        statusBeforeScript: currentComplementarySnapshot.status,
        badgeLevelBeforeScript: currentComplementarySnapshot.label,
        examinationDateBeforeScript: currentComplementarySnapshot.createdAt,
        certificationDateBeforeScript: currentComplementarySnapshot.publishedAt,
        commentByAutoJuryBeforeScript: currentComplementarySnapshot.commentByAutoJury,
      });

      logger.info(`Rescoring certificationCourseId:[${complementaryRescoringCommand.certificationCourseId}] ...`);
      await _rescoreCertification({ complementaryRescoringCommand, eventDispatcher });
      complementaryRescoringCommand.updateSuccessfull();

      const newComplementarySnapshot = await _snapshotCurrentScoring({ certificationCourseId, knex });
      complementaryRescoringCommand.complementaryAfterUpdate({
        statusAfterScript: newComplementarySnapshot.status,
        badgeLevelAfterScript: newComplementarySnapshot.label,
        examinationDateAfterScript: newComplementarySnapshot.createdAt,
        certificationDateAfterScript: newComplementarySnapshot.publishedAt,
        commentByAutoJuryAfterScript: newComplementarySnapshot.commentByAutoJury,
      });
    } catch (error) {
      logger.error(
        error,
        `Could not rescore certificationCourseId:[${complementaryRescoringCommand.certificationCourseId}]`,
      );
      complementaryRescoringCommand.updateFailure();
    } finally {
      rescoringResults.push(complementaryRescoringCommand);
    }
  }

  _output({ rescoringResults });
  return 0;
}

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 1;
    try {
      const certificationCourseIds = process.argv[2]
        .split(',')
        .map((str) => parseInt(str, 10))
        .filter(Number.isInteger);

      exitCode = await main({ certificationCourseIds, knex, eventDispatcher, logger });
    } catch (error) {
      logger.error(error);
      exitCode = 1;
    } finally {
      await disconnect();
      // EventDispatcher makes the process hang, but at this point we know our job is finished
      // eslint-disable-next-line n/no-process-exit
      process.exit(exitCode);
    }
  }
})();

export { main };
