import { knex } from '../../../db/knex-database-connection';
import UserLogin from '../../domain/models/UserLogin';

function _toDomain(userLoginDTO) {
  return new UserLogin({
    id: userLoginDTO.id,
    userId: userLoginDTO.userId,
    failureCount: userLoginDTO.failureCount,
    temporaryBlockedUntil: userLoginDTO.temporaryBlockedUntil,
    blockedAt: userLoginDTO.blockedAt,
    createdAt: userLoginDTO.createdAt,
    updatedAt: userLoginDTO.updatedAt,
  });
}

export default {
  async findByUserId(userId) {
    const foundUserLogin = await knex.from('user-logins').where({ userId }).first();
    return foundUserLogin ? _toDomain(foundUserLogin) : null;
  },

  async create(userLogin) {
    const [userLoginDTO] = await knex('user-logins').insert(userLogin).returning('*');
    return _toDomain(userLoginDTO);
  },

  async update(userLogin) {
    userLogin.updatedAt = new Date();
    const [userLoginDTO] = await knex('user-logins').where({ id: userLogin.id }).update(userLogin).returning('*');
    return _toDomain(userLoginDTO);
  },

  async findByUsername(username) {
    const foundUserLogin = await knex
      .select('user-logins.*')
      .from('user-logins')
      .where('users.email', username.toLowerCase())
      .orWhere('users.username', username.toLowerCase())
      .join('users', 'users.id', 'user-logins.userId')
      .first();

    return foundUserLogin ? _toDomain(foundUserLogin) : null;
  },
};
