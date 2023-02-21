'use strict';
import dotenv from 'dotenv';
dotenv.config();
import { knex, disconnect } from '../../db/knex-database-connection';
import SessionFinalized from '../../lib/domain/events/SessionFinalized';
import certificationAssessmentRepository from '../../lib/infrastructure/repositories/certification-assessment-repository';
import challengeRepository from '../../lib/infrastructure/repositories/challenge-repository';
import certificationIssueReportRepository from '../../lib/infrastructure/repositories/certification-issue-report-repository';
import certificationCourseRepository from '../../lib/infrastructure/repositories/certification-course-repository';
import handleAutoJury from '../../lib/domain/events/handle-auto-jury';
import events from '../../lib/domain/events';
import logger from '../../lib/infrastructure/logger';

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const id = process.argv[2];
  logger.info(`Launch auto jury for session ${id}`);

  const { sessionId, finalizedAt, certificationCenterName, sessionDate, sessionTime, examinerGlobalComment } =
    await knex('sessions')
      .select(
        'id as sessionId',
        'certificationCenter as certificationCenterName',
        'finalizedAt',
        'date as sessionDate',
        'time as sessionTime',
        'examinerGlobalComment'
      )
      .where({ id })
      .first();

  const sessionFinalizedEvent = new SessionFinalized({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    hasExaminerGlobalComment: Boolean(examinerGlobalComment),
  });
  const event = await handleAutoJury({
    event: sessionFinalizedEvent,
    certificationIssueReportRepository,
    certificationAssessmentRepository,
    certificationCourseRepository,
    challengeRepository,
    logger,
  });
  await events.eventDispatcher.dispatch(event);

  logger.info('Done !');
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
    }
  }
})();
