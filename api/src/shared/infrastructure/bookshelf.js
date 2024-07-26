import bookshelf from 'bookshelf';
import _ from 'lodash';
import validator from 'validator';

import { knex } from '../../../db/knex-database-connection.js';
const bookshelfWithKnex = bookshelf(knex);

validator.isRequired = function (value) {
  return !_.isNil(value);
};

validator.isTrue = function (value) {
  return _.isBoolean(value) && value === true;
};

bookshelfWithKnex.plugin('bookshelf-validate', {
  validateOnSave: true,
  validator: validator,
});

export { bookshelfWithKnex as Bookshelf, knex };
