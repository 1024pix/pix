import { BookshelfOrganizationTag } from '../orm-models/OrganizationTag.js';
import { Bookshelf } from '../bookshelf.js';
import { bookshelfUtils } from '../utils/knex-utils.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { AlreadyExistingEntityError, OrganizationTagNotFound } from '../../domain/errors.js';
import { omit } from 'lodash';
import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';
import { Tag } from '../../domain/models/Tag.js';

const create = async function (organizationTag) {
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
};

const remove = async function ({ organizationTagId }) {
  try {
    await BookshelfOrganizationTag.where({ id: organizationTagId }).destroy({ require: true });
  } catch (err) {
    throw new OrganizationTagNotFound('An error occurred while deleting the organization tag');
  }
};

const findOneByOrganizationIdAndTagId = async function ({ organizationId, tagId }) {
  const bookshelfOrganizationTags = await BookshelfOrganizationTag.query((qb) => {
    qb.where('organizationId', organizationId);
    qb.where('tagId', tagId);
  }).fetchAll();

  return bookshelfOrganizationTags.length > 0
    ? bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationTag, bookshelfOrganizationTags)[0]
    : [];
};

const batchCreate = async function (organizationsTags, domainTransaction = DomainTransaction.emptyTransaction()) {
  return Bookshelf.knex
    .batchInsert('organization-tags', organizationsTags)
    .transacting(domainTransaction.knexTransaction);
};

const isExistingByOrganizationIdAndTagId = async function ({ organizationId, tagId }) {
  const organizationTag = await BookshelfOrganizationTag.where({ organizationId, tagId }).fetch({ require: false });

  return !!organizationTag;
};

const getRecentlyUsedTags = async function ({ tagId, numberOfRecentTags }) {
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
};

export {
  create,
  remove,
  findOneByOrganizationIdAndTagId,
  batchCreate,
  isExistingByOrganizationIdAndTagId,
  getRecentlyUsedTags,
};
