import _ from 'lodash';
import Models from '../../domain/models';

export default {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(BookshelfClass, bookshelfObjects) {
  return bookshelfObjects.map((bookshelfObject) => buildDomainObject(BookshelfClass, bookshelfObject));
}

function buildDomainObject(BookshelfClass, bookshelfObject) {
  if (bookshelfObject) {
    return _buildDomainObject(BookshelfClass, bookshelfObject.toJSON());
  }
  return null;
}

function _buildDomainObject(BookshelfClass, bookshelfObjectJson) {
  const Model = Models[BookshelfClass.modelName];
  const domainObject = new Model();

  const mappedObject = _.mapValues(domainObject, (value, key) => {
    const { relationshipType, relationshipClass } = _getBookshelfRelationshipInfo(BookshelfClass, key);

    if ((relationshipType === 'belongsTo' || relationshipType === 'hasOne') && _.isObject(bookshelfObjectJson[key])) {
      return _buildDomainObject(relationshipClass, bookshelfObjectJson[key]);
    }

    if (
      (relationshipType === 'hasMany' || relationshipType === 'belongsToMany') &&
      _.isArray(bookshelfObjectJson[key])
    ) {
      return bookshelfObjectJson[key].map((bookshelfObject) => _buildDomainObject(relationshipClass, bookshelfObject));
    }

    return bookshelfObjectJson[key];
  });

  return new Model(mappedObject);
}

function _getBookshelfRelationshipInfo(BookshelfClass, key) {
  const relatedData =
    typeof BookshelfClass.prototype[key] === 'function' && BookshelfClass.prototype[key]().relatedData;

  if (relatedData) {
    return { relationshipType: relatedData.type, relationshipClass: relatedData.target };
  } else {
    return {};
  }
}
