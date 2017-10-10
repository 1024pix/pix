const ResetPasswordDemand = require('../../../lib/domain/models/data/reset-password-demand');

module.exports = {
  create(demand) {
    return new ResetPasswordDemand(demand).save();
  },

  markAsBeingUsed(email) {
    return ResetPasswordDemand.where({ email }).save({ used: true }, {
      patch: true,
      require: false
    });
  }
};
