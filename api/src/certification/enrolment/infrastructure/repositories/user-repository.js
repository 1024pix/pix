import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { User } from '../../domain/models/User.js';

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const userData = await knexConn.select(['id', 'lang']).from('users').where('users.id', id).first();
  if (!userData) {
    return null;
  }

  return new User(userData);
}
