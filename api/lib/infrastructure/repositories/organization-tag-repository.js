const BookshelfOrganizationTag = require('../orm-models/OrganizationTag');
const Bookshelf = require('../bookshelf');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { AlreadyExistingEntityError, OrganizationTagNotFound } = require('../../domain/errors');
const { omit } = require('lodash');
const DomainTransaction = require('../DomainTransaction');
const OrganizationTagBookshelf = require('../orm-models/OrganizationTag');
const { knex } = require('../../../db/knex-database-connection');
const Tag = require('../../domain/models/Tag');

module.exports = {
  async create(organizationTag) {
    try {
      const organizationTagToCreate = omit(organizationTag, 'id');
      const bookshelfOrganizationTag = await new BookshelfOrganizationTag(organizationTagToCreate).save();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationTag, bookshelfOrganizationTag);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(
          `The tag ${organizationTag.tagId} already exists for the organization ${organizationTag.organizationId}.`
        );
      }
      throw err;
    }
  },

  async delete({ organizationTagId }) {
    try {
      await BookshelfOrganizationTag.where({ id: organizationTagId }).destroy({ require: true });
    } catch (err) {
      throw new OrganizationTagNotFound('An error occurred while deleting the organization tag');
    }
  },

  async findOneByOrganizationIdAndTagId({ organizationId, tagId }) {
    const bookshelfOrganizationTags = await BookshelfOrganizationTag.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('tagId', tagId);
    }).fetchAll();

    return bookshelfOrganizationTags.length > 0
      ? bookshelfToDomainConverter.buildDomainObjects(OrganizationTagBookshelf, bookshelfOrganizationTags)[0]
      : [];
  },

  async batchCreate(organizationsTags, domainTransaction = DomainTransaction.emptyTransaction()) {
    return Bookshelf.knex
      .batchInsert('organization-tags', organizationsTags)
      .transacting(domainTransaction.knexTransaction);
  },

  async isExistingByOrganizationIdAndTagId({ organizationId, tagId }) {
    const organizationTag = await BookshelfOrganizationTag.where({ organizationId, tagId }).fetch({ require: false });

    return !!organizationTag;
  },

  async getRecentlyUsedTags({ tagId, numberOfRecentTags }) {
    const organizationIds = (
      await knex.select('organizationId').from('organization-tags').where('tagId', '=', tagId)
    ).map(({ organizationId }) => organizationId);
    const tags = await knex
      .select(knex.raw('"organization-tags"."tagId", "tags"."name", COUNT("organization-tags"."tagId") AS "usedCount"'))
      .from('organization-tags')
      .join('tags', 'tags.id', '=', 'organization-tags.tagId')
      .whereIn('organization-tags.organizationId', organizationIds)
      .andWhere('organization-tags.tagId', '!=', tagId)
      .groupByRaw('"organization-tags"."tagId", "tags"."name"')
      .orderByRaw('"usedCount" DESC, "tags"."name" ASC')
      .limit(numberOfRecentTags);
    return tags.map(({ tagId: id, name }) => new Tag({ id, name }));
  },
};
