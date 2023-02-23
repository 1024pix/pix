'use strict';
const dotenv = require('dotenv');
dotenv.config();
const { knex, disconnect } = require('../../db/knex-database-connection');
const SessionFinalized = require('../../lib/domain/events/SessionFinalized');
const certificationAssessmentRepository = require('../../lib/infrastructure/repositories/certification-assessment-repository');
const challengeRepository = require('../../lib/infrastructure/repositories/challenge-repository');
const certificationIssueReportRepository = require('../../lib/infrastructure/repositories/certification-issue-report-repository');
const certificationCourseRepository = require('../../lib/infrastructure/repositories/certification-course-repository');
const handleAutoJury = require('../../lib/domain/events/handle-auto-jury');
const events = require('../../lib/domain/events/index.js');
const logger = require('../../lib/infrastructure/logger');

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
