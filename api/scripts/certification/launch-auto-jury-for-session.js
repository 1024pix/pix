import 'dotenv/config';

import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { handleAutoJury } from '../../lib/domain/events/handle-auto-jury.js';
import * as events from '../../lib/domain/events/index.js';
import { SessionFinalized } from '../../lib/domain/events/SessionFinalized.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../lib/infrastructure/monitoring-tools.js';
import * as certificationAssessmentRepository from '../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationIssueReportRepository from '../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as challengeRepository from '../../src/shared/infrastructure/repositories/challenge-repository.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const id = process.argv[2];
  logInfoWithCorrelationIds(`Launch auto jury for session ${id}`);

  const { sessionId, finalizedAt, certificationCenterName, sessionDate, sessionTime, examinerGlobalComment } =
    await knex('sessions')
      .select(
        'id as sessionId',
        'certificationCenter as certificationCenterName',
        'finalizedAt',
        'date as sessionDate',
        'time as sessionTime',
        'examinerGlobalComment',
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
  });
  await events.eventDispatcher.dispatch(event);

  logInfoWithCorrelationIds('Done !');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logErrorWithCorrelationIds(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
