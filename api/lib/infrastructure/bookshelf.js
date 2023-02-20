import validator from 'validator';
import _ from 'lodash';
import { knex } from '../../db/knex-database-connection';
const bookshelf = require('bookshelf')(knex);

validator.isRequired = function (value) {
  return !_.isNil(value);
};

validator.isTrue = function (value) {
  return _.isBoolean(value) && value === true;
};

bookshelf.plugin('bookshelf-validate', {
  validateOnSave: true,
  validator: validator,
});

export default bookshelf;
