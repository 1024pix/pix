const ResetPasswordDemand = require('../orm-models/ResetPasswordDemand.js');
const { PasswordResetDemandNotFoundError } = require('../../../lib/domain/errors.js');

module.exports = {
  create(demand) {
    return new ResetPasswordDemand(demand).save();
  },

  markAsBeingUsed(email) {
    return ResetPasswordDemand.query((qb) => qb.whereRaw('LOWER("email") = ?', email.toLowerCase())).save(
      { used: true },
      {
        patch: true,
        require: false,
      }
    );
  },

  findByTemporaryKey(temporaryKey) {
    return ResetPasswordDemand.where({ temporaryKey, used: false })
      .fetch()
      .catch((err) => {
        if (err instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw err;
      });
  },

  findByUserEmail(email, temporaryKey) {
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
  },
};
