import * as knexUtils from '../utils/knex-utils.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import lodash from 'lodash';

const { omit } = lodash;

import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';
import { Tag } from '../../domain/models/Tag.js';
import { OrganizationTag } from '../../domain/models/index.js';

const create = async function (organizationTag) {
  try {
    const organizationTagToCreate = omit(organizationTag, 'id');
    const [organizationTagCreated] = await knex('organization-tags').insert(organizationTagToCreate).returning('*');
    return new OrganizationTag(organizationTagCreated);
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
  const knexConn = domainTransaction.knexTransaction || knex;

  return knexConn.batchInsert('organization-tags', organizationsTags);
};

const isExistingByOrganizationIdAndTagId = async function ({ organizationId, tagId }) {
  const organizationTag = await knex('organization-tags').where({ organizationId, tagId }).first();
  return Boolean(organizationTag);
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

export { create, batchCreate, isExistingByOrganizationIdAndTagId, getRecentlyUsedTags };
