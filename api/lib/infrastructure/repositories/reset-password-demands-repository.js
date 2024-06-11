import { PasswordResetDemandNotFoundError } from '../../../lib/domain/errors.js';
import { ResetPasswordDemand } from '../../../src/shared/infrastructure/orm-models/ResetPasswordDemand.js';

const create = function (demand) {
  return new ResetPasswordDemand(demand).save();
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

export { create, findByTemporaryKey, findByUserEmail, markAsBeingUsed };
