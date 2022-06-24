import { Tag } from '../../domain/models/Tag';

const knexUtils = require('../utils/knex-utils');
const { AlreadyExistingEntityError, NotFoundError } = require('../../domain/errors');
const { knex } = require('../../../db/knex-database-connection');

export interface TagRepositoryInterface {
  create({ name }: Tag): Promise<Tag>;
  findByName({ name }: Tag): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  get(id: number): Promise<Tag>;
}

export class TagRepository implements TagRepositoryInterface {
  async create({ name }: Tag): Promise<Tag> {
    try {
      const [row] = await knex('tags').insert({ name }).returning('*');
      return new Tag(row);
    } catch (error) {
      if (knexUtils.isUniqConstraintViolated(error)) {
        throw new AlreadyExistingEntityError(`A tag with name ${name} already exists.`);
      }
      throw error;
    }
  }

  async findByName({ name }: Tag): Promise<Tag | null> {
    const row = await knex('tags').where({ name }).first();
    if (!row) {
      return null;
    }
    return new Tag(row);
  }

  async findAll(): Promise<Tag[]> {
    const rows = await knex('tags');
    return rows.map((row) => new Tag(row));
  }

  async get(id: number): Promise<Tag> {
    const row = await knex('tags').where({ id }).first();
    if (!row) {
      throw new NotFoundError("Le tag n'existe pas");
    }
    return new Tag(row);
  }
}

export const tagRepository = new TagRepository();
