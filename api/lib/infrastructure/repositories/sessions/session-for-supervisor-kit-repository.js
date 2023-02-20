import { knex } from '../../../../db/knex-database-connection';
import SessionForSupervisorKit from '../../../domain/read-models/SessionForSupervisorKit';

export default {
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
