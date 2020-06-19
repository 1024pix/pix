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

module.exports = bookshelf;
