const ResetPasswordDemand = require('../orm-models/ResetPasswordDemand');
const { PasswordResetDemandNotFoundError } = require('../../../lib/domain/errors');

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
      .catch((error) => {
        if (error instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw error;
      });
  },

  findByUserEmail(email, temporaryKey) {
    return ResetPasswordDemand.query((qb) => {
      qb.whereRaw('LOWER("email") = ?', email.toLowerCase());
      qb.where({ used: false });
      qb.where({ temporaryKey });
    })
      .fetch()
      .catch((error) => {
        if (error instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw error;
      });
  },
};
