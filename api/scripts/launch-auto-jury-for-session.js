'use strict';
require('dotenv').config();
const { knex } = require('../db/knex-database-connection');
const SessionFinalized = require('../lib/domain/events/SessionFinalized');
const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const certificationIssueReportRepository = require('../lib/infrastructure/repositories/certification-issue-report-repository');
const certificationCourseRepository = require('../lib/infrastructure/repositories/certification-course-repository');
const handleAutoJury = require('../lib/domain/events/handle-auto-jury');
const events = require('../lib/domain/events');
const logger = require('../lib/infrastructure/logger');

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

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      logger.error(err);
      process.exit(1);
    }
  );
}
