const knexUtils = require('../utils/knex-utils.js');
const { AlreadyExistingEntityError, NotFoundError } = require('../../domain/errors.js');
const omit = require('lodash/omit');
const { knex } = require('../../../db/knex-database-connection.js');
const Tag = require('../../domain/models/Tag.js');
module.exports = {
  async create(tag) {
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
  },

  async findByName({ name }) {
    const row = await knex('tags').where({ name }).first();
    if (!row) {
      return null;
    }
    return new Tag(row);
  },

  async findAll() {
    const rows = await knex('tags');
    return rows.map((row) => new Tag(row));
  },

  async get(id) {
    const row = await knex('tags').where({ id }).first();
    if (!row) {
      throw new NotFoundError("Le tag n'existe pas");
    }
    return new Tag(row);
  },
};
