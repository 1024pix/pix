const BookshelfPasswordResetDemand = require('../data/password-reset-demand');
const { PasswordResetDemandNotFoundError } = require('../../domain/errors');

module.exports = {
  create(passwordResetDemandData) {
    return new BookshelfPasswordResetDemand(passwordResetDemandData).save();
  },

  findByTemporaryKey(temporaryKey) {
    return BookshelfPasswordResetDemand.where({ temporaryKey })
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof BookshelfPasswordResetDemand.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
        throw err;
      });
  },

  markAsUsed(temporaryKey) {
    return BookshelfPasswordResetDemand
      .where({ temporaryKey })
      .save({ used: true }, {
        patch: true,
        require: false,
      });
  },

};
