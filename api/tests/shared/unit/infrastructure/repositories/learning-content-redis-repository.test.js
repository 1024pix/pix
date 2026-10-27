import { expect } from 'chai';
import sinon from 'sinon';

import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { LearningContentRedisCache } from '../../../../../src/shared/infrastructure/caches/learning-content-redis-cache.js';
import { LearningContentRedisRepository } from '../../../../../src/shared/infrastructure/repositories/learning-content-redis-repository.js';

describe('Unit | Infrastructure | Repositories | LearningContentRedisRepository', function () {
  describe('#loadMany', function () {
    const ids = ['entity1', 'entity2', 'entity3'];
    const databaseEntities = [
      { id: 'entity1', name: 'Entity 1' },
      { id: 'entity2', name: 'Entity 2' },
      { id: 'entity3', name: 'Entity 3' },
    ];

    let knexConn;

    beforeEach(function () {
      knexConn = {
        raw: sinon.stub(),
        select: sinon.stub().returnsThis(),
        from: sinon.stub().returnsThis(),
        leftJoin: sinon.stub().returnsThis(),
        orderBy: sinon.stub().resolves(databaseEntities),
      };
      sinon.stub(DomainTransaction, 'getConnection').returns(knexConn);
    });

    describe('when the cache has no client pool', function () {
      it('returns the entities loaded from the database', async function () {
        // given
        const cache = new LearningContentRedisCache({ pool: undefined });
        const repository = new LearningContentRedisRepository({ tableName: 'learningcontent.entities', cache });

        // when
        const entities = await repository.loadMany(ids);

        // then
        expect(entities).to.deep.equal(databaseEntities);
        expect(knexConn.raw).to.have.been.calledOnceWithExactly('unnest(?::text[]) with ordinality as ids(id, idx)', [
          ids,
        ]);
      });
    });

    describe('when the cache client pool fails', function () {
      it('returns the entities loaded from the database', async function () {
        // given
        const pool = {
          on: sinon.stub(),
          mGet: sinon.stub().rejects(new Error('Timeout waiting for a client')),
          mSetNX: sinon.stub().rejects(new Error('Timeout waiting for a client')),
        };
        const cache = new LearningContentRedisCache({ pool });
        const repository = new LearningContentRedisRepository({ tableName: 'learningcontent.entities', cache });

        // when
        const entities = await repository.loadMany(ids);

        // then
        expect(entities).to.deep.equal(databaseEntities);
        expect(knexConn.raw).to.have.been.calledOnceWithExactly('unnest(?::text[]) with ordinality as ids(id, idx)', [
          ids,
        ]);
      });
    });
  });
});
