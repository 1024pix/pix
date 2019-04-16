const _ = require('lodash');
const Models = require('../../domain/models');

module.exports = {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(BookshelfClass, bookshelfObjects) {
  return bookshelfObjects.map(
    (bookshelfObject) => buildDomainObject(BookshelfClass, bookshelfObject)
  );
}

function buildDomainObject(BookshelfClass, bookshelfObject) {
  return _buildDomainObject(BookshelfClass.prototype, bookshelfObject.toJSON());
}

function _buildDomainObject(bookshelfPrototype, bookshelfObjectJson) {

  const Model = Models[bookshelfPrototype.domainModelName || bookshelfPrototype.constructor.bookshelfName];
  const domainObject = new Model();

  const mappedObject = _.mapValues(domainObject, (value, key) => {
    const { relationshipType, relationshipPrototype } =
      _getBookshelfRelationshipInfo(bookshelfPrototype, key);

    if ((relationshipType === 'belongsTo' || relationshipType === 'hasOne') && _.isObject(bookshelfObjectJson[key])) {
      return _buildDomainObject(
        relationshipPrototype,
        bookshelfObjectJson[key]
      );
    }

    if ((relationshipType === 'hasMany') && _.isArray(bookshelfObjectJson[key])) {
      return bookshelfObjectJson[key].map(
        (bookshelfObject) => _buildDomainObject(relationshipPrototype, bookshelfObject)
      );
    }

    return bookshelfObjectJson[key];
  });

  return new Model(mappedObject);
}

function _getBookshelfRelationshipInfo(bookshelfPrototype, key) {
  const relatedData = (typeof bookshelfPrototype[key] === 'function') &&
    bookshelfPrototype[key]().relatedData;

  if (relatedData) {
    return { relationshipType: relatedData.type, relationshipPrototype: relatedData.target.prototype };
  } else {
    return {};
  }
}
