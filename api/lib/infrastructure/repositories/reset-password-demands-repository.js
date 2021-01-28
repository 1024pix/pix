const ResetPasswordDemand = require('../data/reset-password-demand');
const { PasswordResetDemandNotFoundError } = require('../../../lib/domain/errors');

module.exports = {
  create(demand) {
    return new ResetPasswordDemand(demand).save();
  },

  markAsBeingUsed(email) {
    return ResetPasswordDemand
      .query((qb) => qb.where('email', 'ILIKE', email))
      .save({ used: true }, {
        patch: true,
        require: false,
      });
  },

  findByTemporaryKey(temporaryKey) {
    return ResetPasswordDemand.where({ temporaryKey, used: false })
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw err;
      });
  },

  findByUserEmail(email, temporaryKey) {
    return ResetPasswordDemand.query((qb) => {
      qb.where('email', 'ILIKE', email);
      qb.where({ 'used': false });
      qb.where({ temporaryKey });
    })
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw err;
      });
  },
};
