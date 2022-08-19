import { Tag } from '../../domain/models/Tag';

const BookshelfTag = require('../orm-models/Tag');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { AlreadyExistingEntityError, NotFoundError } = require('../../domain/errors');
const omit = require('lodash/omit');

export type TagRepositoryType = {
  create({ name }: Tag): Promise<Tag>;
  findByName({ name }: Tag): Promise<Tag>;
  findAll(): Promise<Tag[]>;
  get(id: number): Promise<Tag>;
};

export const tagRepository: TagRepositoryType = {
  async create({ name }: Tag): Promise<Tag> {
    try {
      const bookshelfTag = await new BookshelfTag({ name }).save();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, bookshelfTag);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`A tag with name ${name} already exists.`);
      }
      throw err;
    }
  },

  async findByName({ name }: Tag): Promise<Tag> {
    const tag = await BookshelfTag.where({ name }).fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, tag);
  },

  async findAll(): Promise<Tag[]> {
    const allTags = await BookshelfTag.fetchAll();
    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTag, allTags);
  },

  async get(id: number): Promise<Tag> {
    try {
      const tag = await BookshelfTag.where({ id }).fetch();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfTag, tag);
    } catch (err) {
      if (err instanceof BookshelfTag.NotFoundError) {
        throw new NotFoundError("Le tag n'existe pas");
      }
      throw err;
    }
  },
};
