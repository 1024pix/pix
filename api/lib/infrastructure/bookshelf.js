const knexConfig = require('../../db/knexfile');
const settings = require('./../settings');
const knex = require('knex')(knexConfig[settings.environment]);
const validator = require('validator');

const _ = require('lodash');

validator.isRequired = function(value) {
  return !_.isNil(value);
};

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('bookshelf-validate', {
  validateOnSave: true,
  validator: validator
});

module.exports = bookshelf;
