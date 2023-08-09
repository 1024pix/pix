import { BookshelfOrganizationTag } from '../orm-models/OrganizationTag.js';
import { Bookshelf } from '../bookshelf.js';
import * as knexUtils from '../utils/knex-utils.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import lodash from 'lodash';

const { omit } = lodash;

import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';
import { Tag } from '../../domain/models/Tag.js';

const create = async function (organizationTag) {
  try {
    const organizationTagToCreate = omit(organizationTag, 'id');
    const bookshelfOrganizationTag = await new BookshelfOrganizationTag(organizationTagToCreate).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationTag, bookshelfOrganizationTag);
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError(
        `The tag ${organizationTag.tagId} already exists for the organization ${organizationTag.organizationId}.`,
      );
    }
    throw err;
  }
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
  batchCreate,
  isExistingByOrganizationIdAndTagId,
  getRecentlyUsedTags,
};
