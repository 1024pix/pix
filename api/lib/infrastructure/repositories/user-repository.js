const _ = require('lodash');
const BookshelfUser = require('../data/user');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  findByEmail(email) {
    return BookshelfUser
      .where({ email })
      .fetch({ require: true })
      .then(bookshelfUser => {
        return bookshelfUser.toDomainEntity();
      });
  },

  /**
   * @deprecated Please use #get(userId) that returns a domain User object
   */
  findUserById(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ require: true });
  },

  get(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: true,
        withRelated: ['pixRoles']
      })
      .then(bookshelfUser => bookshelfUser.toDomainEntity())
      .catch(err => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new NotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  save(domainUser) {
    const userRawData = _.omit(domainUser, ['pixRoles']);

    return new BookshelfUser(userRawData)
      .save()
      .then(bookshelfUser => bookshelfUser.toDomainEntity());
  },

  validateData(userRawData) {
    return new BookshelfUser(userRawData).validationErrors();
  },

  isEmailAvailable(email) {
    return BookshelfUser
      .where({ email })
      .fetch()
      .then(user => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  updatePassword(id, hashedPassword) {
    return BookshelfUser.where({ id })
      .save({ password: hashedPassword, cgu: true }, {
        patch: true,
        require: false
      })
      .then(bookshelfUser => bookshelfUser.toDomainEntity());
  }
};
