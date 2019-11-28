const { NotFoundError, DeletionError } = require('../domain/errors');
const bookshelfToDomainConverter = require('./utils/bookshelf-to-domain-converter');

const _identity = (any) => any;
const _createDefaultToDomain = (BookshelfModel) => {
  return (results) => {
    if (Array.isArray(results)) {
      return bookshelfToDomainConverter.buildDomainObjects(BookshelfModel, results);
    }

    return bookshelfToDomainConverter.buildDomainObject(BookshelfModel, results);
  };
};

// Add CRUD operations to repository
function createCommonRepositoryMethods({
  BookshelfModel,
  toDomain,
  adaptToDatabaseForCreate = _identity,
  adaptToDatabaseForUpdate = _identity,
}) {

  if (!toDomain) {
    toDomain = _createDefaultToDomain(BookshelfModel);
  }

  const methods = {
    // Get by id
    get(id) {
      return BookshelfModel
        .where({ id })
        .fetch({ require: true })
        .then(toDomain)
        .catch((error) => {
          if (error instanceof BookshelfModel.NotFoundError) {
            throw new NotFoundError(`Not found ${BookshelfModel.bookshelfName}#get(${id})`);
          }

          throw error;
        });
    },
    // Get by attributes object describing the where clause
    getByAttributes(attributes) {
      return BookshelfModel
        .where(attributes)
        .fetch({ require: true })
        .then(toDomain)
        .catch((error) => {
          if (error instanceof BookshelfModel.NotFoundError) {
            throw new NotFoundError(`Not found ${BookshelfModel.bookshelfName}#getByAttributes(${JSON.stringify(attributes)})`);
          }

          throw error;
        });
    },
    // Find one by attributes object describing the where clause
    findOneByAttributes(attributes) {
      return BookshelfModel
        .where(attributes)
        .fetch({ required: false })
        .then(toDomain);
    },
    // Find many by attributes object describing the where clause
    findByAttributes(attributes) {
      return BookshelfModel
        .where(attributes)
        .orderBy('createdAt')
        .fetchAll()
        .then((result) => result.models.map(toDomain));
    },
    // Create one from attributes object
    create(attributes) {
      return new BookshelfModel(adaptToDatabaseForCreate(attributes))
        .save()
        .then(toDomain);
    },
    // Update one from attributes object
    update(attributes) {
      const adaptedAttributes = adaptToDatabaseForUpdate(attributes);

      return new BookshelfModel({ id: adaptedAttributes.id })
        .save(adaptedAttributes, { patch: true })
        .then((model) => model.refresh())
        .then(toDomain);
    },
    // Delete one by id
    delete(id) {
      return BookshelfModel
        .where({ id })
        .destroy({ require: true })
        .then(() => true)
        .catch(() => {
          throw new DeletionError(`An error occurred while deleting the ${BookshelfModel.bookshelfName} id ${id}`);
        });
    },
    // Delete one by attributes
    deleteByAttributes(attributes) {
      return BookshelfModel
        .where(attributes)
        .destroy({ require: true })
        .then(() => true)
        .catch(() => {
          throw new DeletionError(`An error occurred while deleting the ${BookshelfModel.bookshelfName} by ${JSON.stringify(attributes)}`);
        });
    },
  };

  return methods;
}

module.exports = createCommonRepositoryMethods;
