import { expect } from 'chai';
import sinon from 'sinon';

import { LearningContentRedisCache } from '../../../../../src/shared/infrastructure/caches/learning-content-redis-cache.js';

describe('Unit | Infrastructure | Caches | LearningContentRedisCache', function () {
  describe('#getEntities', function () {
    const keys = ['entity:1', 'entity:2', 'entity:3'];

    it('returns parsed entities, with undefined for keys that are not cached', async function () {
      // given
      const pool = { on: sinon.stub(), mGet: sinon.stub() };
      pool.mGet.withArgs(keys).resolves(['{"id":"1"}', null, '{"id":"3"}']);
      const cache = new LearningContentRedisCache({ pool });

      // when
      const entities = await cache.getEntities(keys);

      // then
      expect(entities).to.deep.equal([{ id: '1' }, undefined, { id: '3' }]);
    });

    describe('when there is no client pool', function () {
      it('returns a dense array of undefined, one per key', async function () {
        // given
        const cache = new LearningContentRedisCache({ pool: undefined });

        // when
        const entities = await cache.getEntities(keys);

        // then
        expect(entities).to.deep.equal([undefined, undefined, undefined]);
        // Object.keys skips holes, so this also checks the array is dense
        expect(Object.keys(entities)).to.deep.equal(['0', '1', '2']);
      });
    });

    describe('when the client pool fails', function () {
      it('returns a dense array of undefined, one per key', async function () {
        // given
        const pool = { on: sinon.stub(), mGet: sinon.stub().rejects(new Error('Timeout waiting for a client')) };
        const cache = new LearningContentRedisCache({ pool });

        // when
        const entities = await cache.getEntities(keys);

        // then
        expect(entities).to.deep.equal([undefined, undefined, undefined]);
        // Object.keys skips holes, so this also checks the array is dense
        expect(Object.keys(entities)).to.deep.equal(['0', '1', '2']);
      });
    });
  });
});
