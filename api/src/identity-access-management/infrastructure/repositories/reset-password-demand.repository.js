import { knex } from '../../../../db/knex-database-connection.js';
import { PasswordResetDemandNotFoundError } from '../../../../lib/domain/errors.js';
import { ResetPasswordDemand } from '../../../../lib/infrastructure/orm-models/ResetPasswordDemand.js';
import { ResetPasswordDemand as ResetPasswordDemandModel } from '../../domain/models/ResetPasswordDemand.js';

const RESET_PASSWORD_DEMANDS_TABLE_NAME = 'reset-password-demands';

const create = async function (createResetPasswordDemandDto) {
  const [inserted] = await knex(RESET_PASSWORD_DEMANDS_TABLE_NAME).insert(createResetPasswordDemandDto).returning('*');
  return _toDomain(inserted);
};

const markAsBeingUsed = function (email) {
  return ResetPasswordDemand.query((qb) => qb.whereRaw('LOWER("email") = ?', email.toLowerCase())).save(
    { used: true },
    {
      patch: true,
      require: false,
    },
  );
};

const findByTemporaryKey = function (temporaryKey) {
  return ResetPasswordDemand.where({ temporaryKey, used: false })
    .fetch()
    .catch((err) => {
      if (err instanceof ResetPasswordDemand.NotFoundError) {
        throw new PasswordResetDemandNotFoundError();
      }
      throw err;
    });
};

const findByUserEmail = function (email, temporaryKey) {
  return ResetPasswordDemand.query((qb) => {
    qb.whereRaw('LOWER("email") = ?', email.toLowerCase());
    qb.where({ used: false });
    qb.where({ temporaryKey });
  })
    .fetch()
    .catch((err) => {
      if (err instanceof ResetPasswordDemand.NotFoundError) {
        throw new PasswordResetDemandNotFoundError();
      }
      throw err;
    });
};

/**
 * @typedef {Object} ResetPasswordDemandRepository
 */
export { create, findByTemporaryKey, findByUserEmail, markAsBeingUsed };

function _toDomain(data) {
  return new ResetPasswordDemandModel(data);
}
