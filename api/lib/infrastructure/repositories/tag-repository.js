const BookshelfTag = require('../data/tag');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { AlreadyExistingEntityError } = require('../../domain/errors');
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
};
