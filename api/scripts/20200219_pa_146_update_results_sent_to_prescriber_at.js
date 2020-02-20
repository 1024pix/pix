const { knex } = require('../db/knex-database-connection');

/**
 * Utilisation
 * ===========
 *
 * ``node 20200219_pa_146_update_results_sent_to_prescriber_at_test.js``
 */

function updateResultsSentToPrescribedDate(prescribedAtDatetime = new Date()) {
  const updateRequest = `
    update sessions
    set "resultsSentToPrescriberAt" = ?
    where exists
    (
          select 1
          from "certification-courses" as cc1
          where sessions.id = cc1."sessionId"
          and cc1."isPublished" is true
        
    )

  `;
  return knex.raw(updateRequest, prescribedAtDatetime);
}

if (require.main === module) {
  updateResultsSentToPrescribedDate()
    .then(() => console.log('Sessions\' resultsSentToPrescriberAt field updated.'))
    .catch(console.error)
    .finally(() => process.exit(0));
}

module.exports = {
  updateResultsSentToPrescribedDate,
};
