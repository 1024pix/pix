import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionForInvigilatorKit } from '../../domain/read-models/SessionForInvigilatorKit.js';

const get = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select(
      'sessions.id',
      'sessions.date',
      'sessions.time',
      'sessions.address',
      'sessions.room',
      'sessions.examiner',
      'sessions.accessCode',
      'sessions.invigilatorPassword',
      'sessions.version',
    )
    .from('sessions')
    .where({ 'sessions.id': id })
    .first();

  return _toDomain(results);
};

export { get };

function _toDomain(results) {
  return new SessionForInvigilatorKit({
    ...results,
    invigilatorPassword: results.invigilatorPassword,
  });
}
