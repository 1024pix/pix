import { setTimeout } from 'node:timers/promises';

import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { LearningContentRedisRepository } from '../../../../../src/shared/infrastructure/repositories/learning-content-redis-repository.js';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const SCHEMA_NAME = 'learningcontent';
const TABLE_NAME = 'entities';

describe('Integration | Repository | LearningContentRedis', function () {
  /** @type {string} */
  let tableName;

  /** @type {LearningContentRedisRepository} */
  let repository;

  /** @type {sinon.SinonStub} */
  let queryHook;

  before(function () {
    tableName = `${SCHEMA_NAME}.${TABLE_NAME}`;
    repository = new LearningContentRedisRepository({ tableName });
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

    queryHook = sinon.stub();
    knex.addListener('query-response', queryHook);
  });

  afterEach(async function () {
    knex.removeListener('query-response', queryHook);
  });

  describe('#load', function () {
    it('returns entity', async function () {
      // given
      const id = 'entity3';

      // when
      const dto = await repository.load(id);

      // then
      expect(dto).to.deep.equal({ id: 'entity3', name: 'Entity 3', group: 'group1' });
      expect(queryHook).to.have.been.calledOnce;
    });

    describe('when result is cached', function () {
      it('returns entity from cache', async function () {
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

    describe('when id is not found', function () {
      it('returns null', async function () {
        // given
        const id = 'not found';

        // when
        const dto = await repository.load(id);

        // then
        expect(dto).to.be.null;
      });

      describe('when result is cached', function () {
        it('returns null from cache', async function () {
          // given
          const id = 'not found';
          await repository.load(id);
          queryHook.reset();

          // when
          const dto = await repository.load(id);

          // then
          expect(dto).to.be.null;
          expect(queryHook).not.to.have.been.called;
        });
      });
    });

    describe('when database error', function () {
      it('throws an Error', async function () {
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

  describe('#loadMany', function () {
    describe('when no database errors', function () {
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
        expect(queryHook).to.have.been.calledOnce;
      });

      describe('when result is cached', function () {
        it('returns entities from cache', async function () {
          // given
          const cachedIds = ['entity1', 'entity4', 'entity5'];
          const ids = ['entity4', 'entity1', 'entity5'];
          await repository.loadMany(cachedIds);
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

      describe('when result is partially cached', function () {
        it('returns entities from cache and db', async function () {
          // given
          const cachedIds = ['entity2', 'entity3', 'entity5'];
          const ids = ['entity4', 'entity1', 'entity5'];
          await repository.loadMany(cachedIds);
          queryHook.reset();

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
      });

      describe('when called with an empty array', function () {
        it('returns an empty array', async function () {
          // given
          const ids = [];

          // when
          const dtos = await repository.loadMany(ids);

          // then
          expect(dtos).to.deep.equal([]);
          expect(queryHook).not.to.have.been.called;
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
          expect(queryHook).to.have.been.calledOnce;
        });

        describe('when result is cached', function () {
          it('returns null for missing entities', async function () {
            // given
            const ids = ['entity4', 'notfound', 'entity5'];
            await repository.loadMany(ids);
            queryHook.reset();

            // when
            const dtos = await repository.loadMany(ids);

            // then
            expect(dtos).to.deep.equal([
              { id: 'entity4', name: 'Entity 4', group: 'group2' },
              null,
              { id: 'entity5', name: 'Entity 5', group: 'group2' },
            ]);
            expect(queryHook).not.to.have.been.called;
          });
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
      expect(queryHook).to.have.been.calledOnce;
    });
  });

  describe('#find', function () {
    describe('when no database errors', function () {
      it('returns matched entities', async function () {
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
        it('returns entities from cache', async function () {
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

      describe('when no matching results', function () {
        it('returns an empty array', async function () {
          // given
          const group = 'unknownGroup';
          const cacheKey = 'findByGroup(unknownGroup)';
          const callback = (knex) => knex.where({ group }).orderBy('id');

          // when
          const dtos = await repository.find(cacheKey, callback);

          // then
          expect(dtos).to.deep.equal([]);
          expect(queryHook).to.have.been.calledOnce;
        });

        describe('when result is cached', function () {
          it('returns an empty array from cache', async function () {
            // given
            const group = 'unknownGroup';
            const cacheKey = 'findByGroup(unknownGroup)';
            const callback = (knex) => knex.where({ group }).orderBy('id');
            await repository.find(cacheKey, callback);
            queryHook.reset();

            // when
            const dtos = await repository.find(cacheKey, callback);

            // then
            expect(dtos).to.deep.equal([]);
            expect(queryHook).not.to.have.been.called;
          });
        });
      });
    });

    describe('when database error in find ids query', function () {
      it('throws an Error', async function () {
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
      it('throws an Error', async function () {
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

  describe('isEnabled', function () {
    [
      ['0/1', 'web-1', false],
      ['0/1', 'web-2', false],
      ['0/1', 'web-10', false],
      ['1/1', 'web-1', true],
      ['1/1', 'web-2', true],
      ['1/1', 'web-10', true],
      ['1/2', 'web-1', true],
      ['1/2', 'web-2', false],
      ['1/2', 'web-3', true],
      ['1/2', 'web-4', false],
      ['1/2', 'web-10', false],
      ['1/2', 'web-11', true],
      ['1/3', 'web-1', true],
      ['1/3', 'web-2', false],
      ['1/3', 'web-3', false],
      ['1/3', 'web-4', true],
      ['1/3', 'web-5', false],
      ['1/3', 'web-6', false],
      ['2/3', 'web-1', true],
      ['2/3', 'web-2', true],
      ['2/3', 'web-3', false],
      ['2/3', 'web-4', true],
      ['2/3', 'web-5', true],
      ['2/3', 'web-6', false],
    ].forEach(([isLearningContentCacheRedis, containerName, expectedValue]) => {
      describe(`when isLearningContentCacheRedis is ${isLearningContentCacheRedis} and container name is ${containerName}`, function () {
        it(`returns ${expectedValue}`, async function () {
          // given
          sinon.stub(config.infra, 'containerName').value(containerName);
          await featureToggles.set('isLearningContentCacheRedis', isLearningContentCacheRedis);
          await setTimeout(5);

          // when
          const value = LearningContentRedisRepository.isEnabled;

          // then
          expect(value).to.equal(expectedValue);
        });
      });
    });
  });
});
