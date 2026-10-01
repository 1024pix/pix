import { expect } from 'chai';

import { LearningContentPostgresRepository } from '../../../../../src/shared/infrastructure/repositories/learning-content-postgres-repository.js';
import { knex } from '../../../../tooling/databases.js';

const SCHEMA_NAME = 'learningcontent';
const TABLE_NAME = 'entities';

describe('Integration | Repository | LearningContentPostgres', function () {
  /** @type {string} */
  let tableName;

  /** @type {LearningContentPostgresRepository} */
  let repository;

  before(function () {
    tableName = `${SCHEMA_NAME}.${TABLE_NAME}`;
    repository = new LearningContentPostgresRepository({ tableName });
  });

  beforeEach(async function () {
    await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists(TABLE_NAME);

    await knex.schema.withSchema(SCHEMA_NAME).createTable(TABLE_NAME, (t) => {
      t.string('id').primary();
      t.string('name');
      t.string('group');
    });

    await knex.withSchema(SCHEMA_NAME).insert({ id: 'entity1', name: 'Entity 1', group: 'group1' }).into(TABLE_NAME);
    await knex.withSchema(SCHEMA_NAME).insert({ id: 'entity2', name: 'Entity 2', group: 'group1' }).into(TABLE_NAME);
    await knex.withSchema(SCHEMA_NAME).insert({ id: 'entity3', name: 'Entity 3', group: 'group1' }).into(TABLE_NAME);
    await knex.withSchema(SCHEMA_NAME).insert({ id: 'entity4', name: 'Entity 4', group: 'group2' }).into(TABLE_NAME);
    await knex.withSchema(SCHEMA_NAME).insert({ id: 'entity5', name: 'Entity 5', group: 'group2' }).into(TABLE_NAME);
  });

  describe('#load', function () {
    it('returns entity', async function () {
      // given
      const id = 'entity3';

      // when
      const dto = await repository.load(id);

      // then
      expect(dto).to.deep.equal({ id: 'entity3', name: 'Entity 3', group: 'group1' });
    });

    describe('when id is not found', function () {
      it('returns null', async function () {
        // given
        const id = 'not found';

        // when
        const dto = await repository.load(id);

        // then
        expect(dto).to.be.null;
      });
    });
  });

  describe('#loadMany', function () {
    it('returns entities from database', async function () {
      // given
      const ids = ['entity4', 'entity1', 'entity5'];

      // when
      const dtos = await repository.loadMany(ids);

      // then
      expect(dtos).to.deep.equal([
        { id: 'entity4', name: 'Entity 4', group: 'group2' },
        { id: 'entity1', name: 'Entity 1', group: 'group1' },
        { id: 'entity5', name: 'Entity 5', group: 'group2' },
      ]);
    });

    describe('when called with an empty array', function () {
      it('returns an empty array', async function () {
        // given
        const ids = [];

        // when
        const dtos = await repository.loadMany(ids);

        // then
        expect(dtos).to.deep.equal([]);
      });
    });

    describe('when some ids are not found', function () {
      it('returns null for missing entities', async function () {
        // given
        const ids = ['entity4', 'notfound', 'entity5'];

        // when
        const dtos = await repository.loadMany(ids);

        // then
        expect(dtos).to.deep.equal([
          { id: 'entity4', name: 'Entity 4', group: 'group2' },
          null,
          { id: 'entity5', name: 'Entity 5', group: 'group2' },
        ]);
      });
    });
  });

  describe('getMany', function () {
    it('returns entities', async function () {
      // given
      const ids = ['entity4', null, 'entity1', 'entity4', undefined, 'entity5', 'entity5'];

      // when
      const dtos = await repository.getMany(ids);

      // then
      expect(dtos).to.deep.equal([
        { id: 'entity4', name: 'Entity 4', group: 'group2' },
        { id: 'entity1', name: 'Entity 1', group: 'group1' },
        { id: 'entity5', name: 'Entity 5', group: 'group2' },
      ]);
    });
  });

  describe('#find', function () {
    const cacheKey = 'unused';

    it('returns matched entities', async function () {
      // given
      const group = 'group1';
      const callback = (knex) => knex.where({ group }).orderBy('id');

      // when
      const dtos = await repository.find(cacheKey, callback);

      // then
      expect(dtos).to.deep.equal([
        { id: 'entity1', name: 'Entity 1', group: 'group1' },
        { id: 'entity2', name: 'Entity 2', group: 'group1' },
        { id: 'entity3', name: 'Entity 3', group: 'group1' },
      ]);
    });

    describe('when no matching results', function () {
      it('returns an empty array', async function () {
        // given
        const group = 'unknownGroup';
        const callback = (knex) => knex.where({ group }).orderBy('id');

        // when
        const dtos = await repository.find(cacheKey, callback);

        // then
        expect(dtos).to.deep.equal([]);
      });
    });
  });
});
