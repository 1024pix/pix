import { knex } from '../../../../../db/knex-database-connection.js';
import { SessionForInvigilatorKit } from '../../domain/read-models/SessionForInvigilatorKit.js';

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
  return new SessionForInvigilatorKit({
    ...results,
    invigilatorPassword: results.supervisorPassword,
  });
}
