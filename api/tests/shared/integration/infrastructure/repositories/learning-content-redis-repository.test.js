import { expect } from 'chai';
import sinon from 'sinon';

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
    describe('when no database errors', function () {
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
});
