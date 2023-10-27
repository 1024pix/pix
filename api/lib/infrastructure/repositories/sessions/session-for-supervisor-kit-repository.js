import { knex } from '../../../../db/knex-database-connection.js';
import { SessionForSupervisorKit } from '../../../domain/read-models/SessionForSupervisorKit.js';

const get = async function (idSession) {
  const results = await knex
    .select(
      'sessions.id',
      'sessions.date',
      'sessions.time',
      'sessions.address',
      'sessions.room',
      'sessions.examiner',
      'sessions.accessCode',
      'sessions.supervisorPassword',
      'sessions.version',
    )
    .from('sessions')
    .where({ 'sessions.id': idSession })
    .first();

  return _toDomain(results);
};

export { get };

function _toDomain(results) {
  return new SessionForSupervisorKit({
    ...results,
  });
}
