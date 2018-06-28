const knexConfig = require('../../db/knexfile');
const settings = require('./../settings');
const logger = require('./logger');
const validator = require('validator');
const _ = require('lodash');

const knex = require('knex')(knexConfig[settings.environment]);
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

if (bookshelf.VERSION !== '0.12.1') {
  logger.error('WARNING: nous avons patché la version 0.12.1 de Bookshelf. Risque de bug dans les versions à venir.');
  logger.error('WARNING: supprimer le patch si `Model.count()` retourne un Integer sous PostgreSQL. Réréfence: https://github.com/bookshelf/bookshelf/issues/1275');
}

// XXX a supprimer si Model.count() retourne un Integer
// ref: https://github.com/bookshelf/bookshelf/issues/1275
bookshelf.plugin(bookshelf => {
  const Model = bookshelf.Model;

  const PatchedModel = Model.extend({
    count(...options) {
      const promise = Model.prototype.count.apply(this, options);
      return promise.then(count => parseInt(count, 10));
    }
  });

  bookshelf.Model = PatchedModel;
});

module.exports = bookshelf;
