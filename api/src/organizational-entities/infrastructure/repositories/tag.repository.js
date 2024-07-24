import lodash from 'lodash';

import { AlreadyExistingEntityError } from '../../../../lib/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';

const { omit } = lodash;

import { knex } from '../../../../db/knex-database-connection.js';
import { Tag } from '../../domain/models/Tag.js';

const create = async function (tag) {
  try {
    const tagToCreate = omit(tag, 'id');
    const [row] = await knex('tags').insert(tagToCreate).returning('*');
    return new Tag(row);
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error)) {
      throw new AlreadyExistingEntityError(`A tag with name ${tag.name} already exists.`);
    }
    throw error;
  }
};

const findByName = async function ({ name }) {
  const row = await knex('tags').where({ name }).first();
  if (!row) {
    return null;
  }
  return new Tag(row);
};

const findAll = async function () {
  const rows = await knex('tags');
  return rows.map((row) => new Tag(row));
};

const findByIds = async function (tagIds, domainTransaction) {
  const knexConn = domainTransaction.knexTransaction;
  const rows = await knexConn('tags').whereIn('id', tagIds);
  return rows.map((row) => new Tag(row));
};

const tagRepository = { create, findAll, findByIds, findByName };
export { tagRepository };
