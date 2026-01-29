import lodash from 'lodash';

import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';

const { omit } = lodash;

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OrganizationTag } from '../../../shared/domain/models/OrganizationTag.js';
import { Tag } from '../../domain/models/Tag.js';

const create = async function (organizationTag) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const organizationTagToCreate = omit(organizationTag, 'id');
    const [organizationTagCreated] = await knexConn('organization-tags').insert(organizationTagToCreate).returning('*');
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

const batchCreate = async function (organizationsTags) {
  const knexConn = DomainTransaction.getConnection();

  return knex.batchInsert('organization-tags', organizationsTags).transacting(knexConn.isTransaction ? knexConn : null);
};

const isExistingByOrganizationIdAndTagId = async function ({ organizationId, tagId }) {
  const knexConn = DomainTransaction.getConnection();
  const organizationTag = await knexConn('organization-tags').where({ organizationId, tagId }).first();
  return Boolean(organizationTag);
};

const getRecentlyUsedTags = async function ({ tagId, numberOfRecentTags }) {
  const knexConn = DomainTransaction.getConnection();
  const organizationIds = (
    await knexConn.select('organizationId').from('organization-tags').where('tagId', '=', tagId)
  ).map(({ organizationId }) => organizationId);
  const tags = await knexConn
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

export { batchCreate, create, getRecentlyUsedTags, isExistingByOrganizationIdAndTagId };
