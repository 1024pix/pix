const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const Models = require('../../domain/models');

const belongsToKeys = _.keys(Models).map((key) => key.toLowerCase());
const hasManyKeys = _.keys(Models).map((key) => key.toLowerCase() + 's');

module.exports = {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(bookshelfObjects) {
  const modelName = _getModelName(bookshelfObjects[0]);

  return bookshelfObjects.map(
    (bookshelfObject) => _buildDomainObject(new Models[modelName], bookshelfObject.toJSON())
  );
}

function buildDomainObject(bookshelfObject) {
  const modelName = _getModelName(bookshelfObject);

  return _buildDomainObject(new Models[modelName], bookshelfObject.toJSON());
}

function _getModelName(bookshelfObject) {
  return _.findKey(Bookshelf._models, (BookshelfModel) => {
    return bookshelfObject instanceof BookshelfModel;
  });
}

function _buildDomainObject(domainObject, bookshelfObject) {
  return _.mapValues(domainObject, (value, key) => {
    if (belongsToKeys.includes(key) && bookshelfObject[key] instanceof Object) {
      return _buildDomainObject(new Models[_.capitalize(key)], bookshelfObject[key]);
    }
    
    if (hasManyKeys.includes(key) && Array.isArray(bookshelfObject[key])) {
      return bookshelfObject[key].map(
        (bookshelfObject) => _buildDomainObject(new Models[_.capitalize(key)], bookshelfObject)
      );
    }

    return bookshelfObject[key];
  });
}
