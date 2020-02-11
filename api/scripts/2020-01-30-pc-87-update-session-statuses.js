const { knex } = require('../db/knex-database-connection');

const sessionIdsWithReport = require('./2020-01-30-pc-87-session-ids-with-reports.json');

function updateSessionStatuses(sessionIds, finalizationDatetime = new Date()) {
  const updateRequest = `
    update sessions
    set
      status = 'finalized',
      "finalizedAt" = ?
    where id = ANY(?)
    or exists
    (
      select 1
      from "certification-courses" as cc
      where sessions.id = cc."sessionId"
      and cc."isPublished" is true
    )
  `;
  return knex.raw(updateRequest, [finalizationDatetime, sessionIds]);
}

if (require.main === module) {
  console.log('Updating session statuses to finalized...');
  updateSessionStatuses(sessionIdsWithReport)
    .then(() => console.log('Session statuses updated.'))
    .catch((error) => console.error(error))
    .finally(() => process.exit(0));
}

module.exports = {
  updateSessionStatuses,
};
