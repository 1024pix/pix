const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const Models = require('../../domain/models');

const belongsToKeys = _.keys(Models).map((key) => _.lowerFirst(key));
const hasManyKeys = _.keys(Models).map((key) => _.lowerFirst(key) + 's');

module.exports = {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(bookshelfObjects) {
  if (bookshelfObjects.length === 0) {
    return [];
  }

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
      return _buildDomainObject(new Models[_.upperFirst(key)], bookshelfObject[key]);
    }

    if (hasManyKeys.includes(key) && Array.isArray(bookshelfObject[key])) {
      return bookshelfObject[key].map(
        (bookshelfObject) => _buildDomainObject(new Models[_.upperFirst(key).slice(0, -1)], bookshelfObject)
      );
    }

    return bookshelfObject[key];
  });
}
