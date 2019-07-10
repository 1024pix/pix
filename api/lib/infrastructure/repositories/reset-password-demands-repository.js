const ResetPasswordDemand = require('../data/reset-password-demand');
const { PasswordResetDemandNotFoundError } = require('../../../lib/domain/errors');

module.exports = {
  create(demand) {
    return new ResetPasswordDemand(demand).save();
  },

  markAsBeingUsed(email) {
    return ResetPasswordDemand.where({ email }).save({ used: true }, {
      patch: true,
      require: false
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
    return ResetPasswordDemand.where({ email, used: false, temporaryKey })
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof ResetPasswordDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw err;
      });
  }
};
