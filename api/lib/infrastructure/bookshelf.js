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

// The registry plugin who adds the .model() method on bookshelf does not
// add the table name on the instance, which is inconvenient. This decorator
// ensures that it is accessible on the `bookshelfName` property
bookshelf.model = ((f) => (...args) => {
  // Keep old Bookshelf version (0.15.0) behaviour
  // XXX see https://github.com/bookshelf/bookshelf/wiki/Migrating-from-0.15.1-to-1.0.0#default-to-require-true-on-modelfetch-and-collectionfetchone
  if (args[1]) {
    args[1].requireFetch = false;
  }
  // This is like doing bookshelf.model() with any arguments it is passed
  const Ctor = f.call(bookshelf, ...args);
  // The original method returns Bookshelf constructor so we must return it
  return Ctor;
})(bookshelf.model);

module.exports = bookshelf;
