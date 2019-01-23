const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const Models = require('../../domain/models');

const attributesForBelongsToRelationships = _.keys(Models).map((key) => _.lowerFirst(key));
const attributesForHasManyRelationships = _.keys(Models).map((key) => _.lowerFirst(key) + 's');

module.exports = {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(bookshelfObjects) {
  if (bookshelfObjects.length === 0) {
    return [];
  }

  // We do that on the first element to avoid the _getModelName operations on the full array
  const modelName = _getModelName(bookshelfObjects[0]);

  return bookshelfObjects.map(
    (bookshelfObject) => _buildDomainObject(bookshelfObject.toJSON(), modelName)
  );
}

function buildDomainObject(bookshelfObject) {
  const modelName = _getModelName(bookshelfObject);

  return _buildDomainObject(bookshelfObject.toJSON(), modelName);
}

// Only way we could figure to retrieve the modelName of a Bookshelf object
// because Bookshelf does not set correctly the constructor of its models
function _getModelName(bookshelfObject) {
  return _.findKey(Bookshelf._models, (BookshelfModel) => {
    return bookshelfObject instanceof BookshelfModel;
  });
}

function _buildDomainObject(bookshelfObject, modelName) {
  const domainObject = new Models[modelName];

  const mappedObject = _.mapValues(domainObject, (value, key) => {
    const isABelongsToRelationship =
      attributesForBelongsToRelationships.includes(key) && _getModelName(bookshelfObject[key]);

    if (isABelongsToRelationship) {
      return _buildDomainObject(bookshelfObject[key], _.upperFirst(key));
    }

    const isAHasManyRelationship =
      attributesForHasManyRelationships.includes(key) && Array.isArray(bookshelfObject[key]);

    if (isAHasManyRelationship) {
      return bookshelfObject[key].map(
        (bookshelfObject) => _buildDomainObject(bookshelfObject, _.upperFirst(key).slice(0, -1))
      );
    }

    return bookshelfObject[key];
  });

  Object.assign(domainObject, mappedObject);

  return domainObject;
}
