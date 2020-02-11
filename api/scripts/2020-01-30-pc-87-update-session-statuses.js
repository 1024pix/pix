const { knex } = require('../db/knex-database-connection');

/**
 * Utilisation
 * ===========
 *
 * Créer un fichier json contenant la liste des ids des sessions dont on a
 * déjà reçu le pv de session. Par exemple :
 * `[ 123, 456 ]`
 *
 * Puis invoquer le script en lui passant ce fichier par stdin :
 * ```
 * node scripts/2020-01-30-pc-87-update-session-statuses < sessionIds.json
 * ```
 */

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

function readStream(stream) {
  stream.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', (chunk) => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
}

if (require.main === module) {
  readStream(process.stdin)
    .then(JSON.parse)
    .then((sessionIdsWithReport) => {
      console.log('Parsed IDs of session with reports:', sessionIdsWithReport);
      console.log('Updating session statuses to finalized...');
      return sessionIdsWithReport;
    })
    .then(updateSessionStatuses)
    .then(() => console.log('Session statuses updated.'))
    .catch(console.error)
    .finally(() => process.exit(0));
}

module.exports = {
  updateSessionStatuses,
};
