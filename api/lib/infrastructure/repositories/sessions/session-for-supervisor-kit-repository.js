const { knex } = require('../../../../db/knex-database-connection.js');
const SessionForSupervisorKit = require('../../../domain/read-models/SessionForSupervisorKit.js');

module.exports = {
  async get(idSession) {
    const results = await knex
      .select(
        'sessions.id',
        'sessions.date',
        'sessions.time',
        'sessions.address',
        'sessions.room',
        'sessions.examiner',
        'sessions.accessCode',
        'sessions.supervisorPassword'
      )
      .from('sessions')
      .where({ 'sessions.id': idSession })
      .first();

    return _toDomain(results);
  },
};

function _toDomain(results) {
  return new SessionForSupervisorKit({
    ...results,
  });
}
