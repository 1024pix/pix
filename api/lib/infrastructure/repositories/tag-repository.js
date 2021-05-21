const BookshelfTag = require('../orm-models/Tag');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const {
  AlreadyExistingEntityError,
  NotFoundError,
} = require('../../domain/errors');
const omit = require('lodash/omit');

module.exports = {

  async create(tag) {
    try {
      const tagToCreate = omit(tag, 'id');
      const bookshelfTag = await new BookshelfTag(tagToCreate).save();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, bookshelfTag);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`A tag with name ${tag.name} already exists.`);
      }
      throw err;
    }
  },

  async findByName({ name }) {
    const tag = await BookshelfTag
      .where({ name })
      .fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, tag);
  },

  async findAll() {
    const allTags = await BookshelfTag.fetchAll();
    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTag, allTags);

  },

  async get(id) {
    try {
      const tag = await BookshelfTag
        .where({ id })
        .fetch();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, tag);
    } catch (err) {
      if (err instanceof BookshelfTag.NotFoundError) {
        throw new NotFoundError('Le tag n\'existe pas');
      }
      throw err;
    }
  },

};
