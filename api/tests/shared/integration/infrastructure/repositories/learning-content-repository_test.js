import sinon from 'sinon';

import { LearningContentRepository } from '../../../../../src/shared/infrastructure/repositories/learning-content-repository.js';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const SCHEMA_NAME = 'learningcontent';
const TABLE_NAME = 'entities';

describe('Integration | Repository | learning-repository', function () {
  /** @type {string} */
  let tableName;

  /** @type {LearningContentRepository} */
  let repository;

  /** @type {sinon.SinonStub} */
  let queryHook;

  before(function () {
    tableName = `${SCHEMA_NAME}.${TABLE_NAME}`;
    repository = new LearningContentRepository({ tableName });
  });

  beforeEach(async function () {
    repository.clearCache();

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

    queryHook = sinon.stub();
    knex.addListener('query', queryHook);
  });

  afterEach(async function () {
    knex.removeListener('query', queryHook);
  });

  describe('#find', function () {
    describe('when no database errors', function () {
      it('should return matched entities', async function () {
        // given
        const group = 'group1';
        const cacheKey = 'findByGroup(group1)';
        const callback = (knex) => knex.where({ group }).orderBy('id');

        // when
        const dtos = await repository.find(cacheKey, callback);

        // then
        expect(dtos).to.deep.equal([
          { id: 'entity1', name: 'Entity 1', group: 'group1' },
          { id: 'entity2', name: 'Entity 2', group: 'group1' },
          { id: 'entity3', name: 'Entity 3', group: 'group1' },
        ]);
        expect(queryHook).to.have.been.calledTwice;
      });

      describe('when result is cached', function () {
        it('should return entities from cache', async function () {
          // given
          const group = 'group1';
          const cacheKey = 'findByGroup(group1)';
          const callback = (knex) => knex.where({ group }).orderBy('id');
          await repository.find(cacheKey, callback);
          queryHook.reset();

          // when
          const dtos = await repository.find(cacheKey, callback);

          // then
          expect(dtos).to.deep.equal([
            { id: 'entity1', name: 'Entity 1', group: 'group1' },
            { id: 'entity2', name: 'Entity 2', group: 'group1' },
            { id: 'entity3', name: 'Entity 3', group: 'group1' },
          ]);
          expect(queryHook).not.to.have.been.called;
        });
      });
    });

    describe('when database error in find ids query', function () {
      it('should throw an Error', async function () {
        // given
        const group = 'group1';
        const cacheKey = 'findByGroup(group1)';
        const callback = (knex) => knex.where({ group }).orderBy('id');
        queryHook.onFirstCall().throws(new Error());

        // when
        const err = await catchErr((...args) => repository.find(...args))(cacheKey, callback);

        // then
        expect(err).to.be.instanceOf(Error);
        expect(queryHook).to.have.been.calledOnce;
      });
    });

    describe('when database error in load entities query', function () {
      it('should throw an Error', async function () {
        // given
        const group = 'group1';
        const cacheKey = 'findByGroup(group1)';
        const callback = (knex) => knex.where({ group }).orderBy('id');
        queryHook.onSecondCall().throws(new Error());

        // when
        const err = await catchErr((...args) => repository.find(...args))(cacheKey, callback);

        // then
        expect(err).to.be.instanceOf(Error);
        expect(queryHook).to.have.been.calledTwice;
      });
    });
  });

  describe('#loadMany', function () {
    describe('when no database errors', function () {
      it('should return entities', async function () {
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
        expect(queryHook).to.have.been.calledOnce;
      });

      describe('when result is cached', function () {
        it('should return entities from cache', async function () {
          // given
          const ids = ['entity4', 'entity1', 'entity5'];
          await repository.loadMany(ids);
          queryHook.reset();

          // when
          const dtos = await repository.loadMany(ids);

          // then
          expect(dtos).to.deep.equal([
            { id: 'entity4', name: 'Entity 4', group: 'group2' },
            { id: 'entity1', name: 'Entity 1', group: 'group1' },
            { id: 'entity5', name: 'Entity 5', group: 'group2' },
          ]);
          expect(queryHook).not.to.have.been.called;
        });
      });
    });

    describe('when database error', function () {
      it('should throw an Error', async function () {
        // given
        const ids = ['entity4', 'entity1', 'entity5'];
        queryHook.onFirstCall().throws(new Error());

        // when
        const err = await catchErr((...args) => repository.loadMany(...args))(ids);

        // then
        expect(err).to.be.instanceOf(Error);
        expect(queryHook).to.have.been.calledOnce;
      });
    });
  });

  describe('#load', function () {
    describe('when no database errors', function () {
      it('should return entity', async function () {
        // given
        const id = 'entity3';

        // when
        const dto = await repository.load(id);

        // then
        expect(dto).to.deep.equal({ id: 'entity3', name: 'Entity 3', group: 'group1' });
        expect(queryHook).to.have.been.calledOnce;
      });

      describe('when result is cached', function () {
        it('should return entity from cache', async function () {
          // given
          const id = 'entity3';
          await repository.load(id);
          queryHook.reset();

          // when
          const dto = await repository.load(id);

          // then
          expect(dto).to.deep.equal({ id: 'entity3', name: 'Entity 3', group: 'group1' });
          expect(queryHook).not.to.have.been.called;
        });
      });
    });

    describe('when database error', function () {
      it('should throw an Error', async function () {
        // given
        const id = 'entity3';
        queryHook.onFirstCall().throws(new Error());

        // when
        const err = await catchErr((...args) => repository.load(...args))(id);

        // then
        expect(err).to.be.instanceOf(Error);
        expect(queryHook).to.have.been.calledOnce;
      });
    });
  });

  describe('getMany', function () {
    describe('when no database errors', function () {
      it('should return entities', async function () {
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
        expect(queryHook).to.have.been.calledOnce;
      });

      describe('when result is cached', function () {
        it('should return entities from cache', async function () {
          // given
          const ids = ['entity4', null, 'entity1', 'entity4', undefined, 'entity5', 'entity5'];
          await repository.getMany(ids);
          queryHook.reset();

          // when
          const dtos = await repository.getMany(ids);

          // then
          expect(dtos).to.deep.equal([
            { id: 'entity4', name: 'Entity 4', group: 'group2' },
            { id: 'entity1', name: 'Entity 1', group: 'group1' },
            { id: 'entity5', name: 'Entity 5', group: 'group2' },
          ]);
          expect(queryHook).not.to.have.been.called;
        });
      });
    });
  });
});
