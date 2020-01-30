const { knex } = require('../db/knex-database-connection');

function updateSessionStatuses(sessionIds){
  const updateRequest = `
    update sessions
    set status = 'finalized'
    where id = ANY(?)
    or exists
    (
      select 1
      from "certification-courses" as cc
      where sessions.id = cc."sessionId"
      and cc."isPublished" is true
    )
  `;
  return knex.raw(updateRequest, [sessionIds]);
}

if (require.main === module) {
  updateSessionStatuses([])
    .then((results
      ) => results.rows)
    .then(console.log, console.error)
    .then(() => process.exit(0));
}

module.exports = updateSessionStatuses;
