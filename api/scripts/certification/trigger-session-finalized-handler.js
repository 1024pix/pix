const { knex } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');
const AutoJuryDone = require('../../lib/domain/events/AutoJuryDone');
const { eventDispatcher } = require('../../lib/domain/events');
const logger = require('../../lib/infrastructure/logger');

async function main() {
  try {
    logger.info('Début');
    const sessionsData = await _retrieveFinalizedUnpublishedUnassignedSessionsData();
    const autoJuryDoneEvents = _buildAutoJuryDoneEventsFromSessionsData(sessionsData);
    await _dispatch(autoJuryDoneEvents);
    logger.info('Fin');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

async function _retrieveFinalizedUnpublishedUnassignedSessionsData() {
  logger.info('\tRécupération des sessions finalisées non publiées non assignées...');
  const sessionsData = await knex('sessions')
    .select(
      'sessions.id',
      'sessions.finalizedAt',
      'sessions.certificationCenter',
      'sessions.date',
      'sessions.time',
      'sessions.examinerGlobalComment'
    )
    .join('finalized-sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where('isPublishable', 'false')
    .whereNull('sessions.publishedAt')
    .whereNull('sessions.assignedCertificationOfficerId');
  logger.info(`\tOK. ${sessionsData.length} récupérées`);
  return sessionsData;
}

function _buildAutoJuryDoneEventsFromSessionsData(sessionsData) {
  logger.info('\tConversion des données en event...');
  const events = sessionsData.map((sessionData) => {
    return new AutoJuryDone({
      sessionId: sessionData.id,
      finalizedAt: sessionData.finalizedAt,
      hasExaminerGlobalComment: Boolean(sessionData.examinerGlobalComment),
      sessionDate: sessionData.date,
      sessionTime: sessionData.time,
      certificationCenterName: sessionData.certificationCenter,
    });
  });
  logger.info('\tOK.');
  return events;
}

async function _dispatch(events) {
  logger.info('\tDispatch des events...');
  await bluebird.map(
    events,
    async (event) => {
      try {
        await eventDispatcher.dispatch(event);
      } catch (error) {
        logger.info(`\t\tErreur sur event : ${event}\n\t\t${error}`);
      }
    },
    { concurrency: ~~process.env.CONCURRENCY || 5 }
  );
  logger.info('\tOK.');
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (error) => {
      logger.error(error);
      process.exit(1);
    }
  );
}

module.exports = main;
