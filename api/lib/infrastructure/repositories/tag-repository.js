import * as knexUtils from '../utils/knex-utils.js';
import { AlreadyExistingEntityError, NotFoundError } from '../../domain/errors.js';
import omit from 'lodash/omit';
import { knex } from '../../../db/knex-database-connection.js';
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

const get = async function (id) {
  const row = await knex('tags').where({ id }).first();
  if (!row) {
    throw new NotFoundError("Le tag n'existe pas");
  }
  return new Tag(row);
};

export { create, findByName, findAll, get };
