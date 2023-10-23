import { knex, disconnect } from '../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import { handleAutoJury } from '../../lib/domain/events/handle-auto-jury.js';
import * as certificationIssueReportRepository from '../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as certificationAssessmentRepository from '../../lib/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../lib/infrastructure/repositories/certification-course-repository.js';
import * as challengeRepository from '../../lib/infrastructure/repositories/challenge-repository.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { SessionFinalized } from '../../lib/domain/events/SessionFinalized.js';
import { eventDispatcher } from '../../lib/domain/events/index.js';
import * as url from 'url';

const IS_FROM_SCRATCH = process.env.IS_FROM_SCRATCH === 'true';
const AUDIT_TABLE = 'autojury-script-audit';

const _triggerAutoJury = async (event) => {
  return await handleAutoJury({
    event,
    certificationIssueReportRepository,
    certificationAssessmentRepository,
    certificationCourseRepository,
    challengeRepository,
    logger,
  });
};

async function _retrieveFinalizedUnpublishedUnassignedSessionsData() {
  return await knex('sessions')
    .select(
      'sessions.id',
      'sessions.certificationCenter',
      'sessions.finalizedAt',
      'sessions.date',
      'sessions.time',
      'sessions.examinerGlobalComment',
    )
    .join('finalized-sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where('isPublishable', '=', 'false')
    .whereNotNull('sessions.finalizedAt')
    .whereNull('sessions.publishedAt')
    .whereNull('sessions.assignedCertificationOfficerId');
}

async function _triggerAutoJuryFromEvents(events) {
  console.error(`\nWork in progress (${events.length})...`);
  return await bluebird.map(
    events,
    async (event) => {
      try {
        await _doing(event.sessionId);
        const resultingEvents = await _triggerAutoJury(event);
        for (const resultingEvent of resultingEvents) {
          await eventDispatcher.dispatch(resultingEvent);
        }
        await _done(event.sessionId);
        process.stderr.write('😻');
      } catch (err) {
        await _toRetry(event.sessionId, err);
        process.stderr.write('👹');
      }
    },
    { concurrency: ~~process.env.CONCURRENCY || 10 },
  );
}

function _sessionDataToEvent(sessionData) {
  return new SessionFinalized({
    sessionId: sessionData.id,
    finalizedAt: sessionData.finalizedAt,
    hasExaminerGlobalComment: Boolean(sessionData.examinerGlobalComment),
    sessionDate: sessionData.date,
    sessionTime: sessionData.time,
    certificationCenterName: sessionData.certificationCenter,
  });
}

async function _writeEventsToAuditTable(events) {
  const dtos = events.map((event) => {
    return {
      ...event,
      status: 'TO DO',
    };
  });
  return await knex.batchInsert(AUDIT_TABLE, dtos);
}

async function _retrieveEventsFromAuditTable() {
  const dtos = await knex(AUDIT_TABLE)
    .select(
      'sessionId',
      'certificationCenterName',
      'finalizedAt',
      'sessionDate',
      'sessionTime',
      'hasExaminerGlobalComment',
    )
    .where('status', '!=', 'DONE');
  return dtos.map((dto) => new SessionFinalized(dto));
}

async function _printAudit() {
  const dtos = await knex(AUDIT_TABLE).select('sessionId', 'status', 'error');

  const todos = dtos.filter((dto) => dto.status === 'TO DO');
  const doings = dtos.filter((dto) => dto.status === 'DOING');
  const dones = dtos.filter((dto) => dto.status === 'DONE');
  const toRetrys = dtos.filter((dto) => dto.status === 'TO RETRY');

  console.error(`😴 TO DO (${todos.length})`);
  todos.forEach((todo) => console.error(' ' + todo.sessionId));
  console.error('\n\n');
  console.error(`🤪 DOING (${doings.length})`);
  doings.forEach((doing) => console.error(' ' + doing.sessionId));
  console.error('\n\n');
  console.error(`😻 DONE (${dones.length})`);
  dones.forEach((done) => console.error(' ' + done.sessionId));
  console.error('\n\n');
  console.error(`👹 TO RETRY (${toRetrys.length})`);
  toRetrys.forEach((toRetry) => {
    console.error(' ' + toRetry.sessionId);
    console.error(' ' + toRetry.error);
  });
}

async function _emptyAuditTable() {
  await knex(AUDIT_TABLE).delete();
}

async function _doing(sessionId) {
  await knex(AUDIT_TABLE).update({ error: '', status: 'DOING' }).where({ sessionId });
}

async function _done(sessionId) {
  await knex(AUDIT_TABLE).update({ status: 'DONE' }).where({ sessionId });
}

async function _toRetry(sessionId, error) {
  await knex(AUDIT_TABLE)
    .update({ status: 'TO RETRY', error: error.stack.toString().substring(0, 700) })
    .where({ sessionId });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  let finalizedSessionEvents;

  if (IS_FROM_SCRATCH) {
    await _emptyAuditTable();
    const sessionsData = await _retrieveFinalizedUnpublishedUnassignedSessionsData();
    finalizedSessionEvents = sessionsData.map(_sessionDataToEvent);
    await _writeEventsToAuditTable(finalizedSessionEvents);
  } else {
    finalizedSessionEvents = await _retrieveEventsFromAuditTable();
  }

  await _triggerAutoJuryFromEvents(finalizedSessionEvents);

  console.log('\n\nDone.');
  console.log('\n***** Results *****');
  await _printAudit();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
