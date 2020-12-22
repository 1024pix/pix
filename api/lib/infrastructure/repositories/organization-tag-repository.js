const BookshelfOrganizationTag = require('../data/organization-tag');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { AlreadyExistingEntityError } = require('../../domain/errors');
const omit = require('lodash/omit');

module.exports = {

  async create(organizationTag) {
    try {
      const organizationTagToCreate = omit(organizationTag, 'id');
      const bookshelfOrganizationTag = await new BookshelfOrganizationTag(organizationTagToCreate).save();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationTag, bookshelfOrganizationTag);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`The tag ${organizationTag.tagId} already exists for the organization ${organizationTag.organizationId}.`);
      }
      throw err;
    }
  },

  async isExistingByOrganizationIdAndTagId({ organizationId, tagId }) {
    const organizationTag = await BookshelfOrganizationTag
      .where({ organizationId, tagId })
      .fetch({ require: false });

    return !!organizationTag;
  },
};
