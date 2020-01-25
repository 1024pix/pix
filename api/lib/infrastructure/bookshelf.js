const validator = require('validator');
const _ = require('lodash');

const { knex } = require('../../db/knex-database-connection');
const bookshelf = require('bookshelf')(knex);

validator.isRequired = function(value) {
  return !_.isNil(value);
};

validator.isTrue = function(value) {
  return _.isBoolean(value) && value === true;
};

bookshelf.plugin('bookshelf-validate', {
  validateOnSave: true,
  validator: validator
});

bookshelf.plugin('registry');

// The registry plugin who adds the .model() method on bookshelf does not
// add the table name on the instance, which is inconvenient. This decorator
// ensures that it is accessible on the `bookshelfName` property
bookshelf.model = ((f) => (...args) => {
  // This is like doing bookshelf.model() with any arguments it is passed
  const Ctor = f.call(bookshelf, ...args);
  // The decoration part
  Ctor.bookshelfName = args[0];
  // The original method returns Bookshelf constructor so we must return it
  return Ctor;
})(bookshelf.model);

bookshelf.plugin('pagination');

// XXX a supprimer si Model.count() retourne un Integer
// ref: https://github.com/bookshelf/bookshelf/issues/1275
bookshelf.plugin((bookshelf) => {
  const Model = bookshelf.Model;

  const PatchedModel = Model.extend({
    count(...options) {
      const promise = Model.prototype.count.apply(this, options);
      return promise.then((count) => parseInt(count, 10));
    }
  });

  bookshelf.Model = PatchedModel;
});

module.exports = bookshelf;
