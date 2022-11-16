import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | Training', function () {
  setupTest();

  describe('#urlForQuery', function () {
    let adapter;

    beforeEach(function () {
      adapter = this.owner.lookup('adapter:training');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build the training url if userId is passed in query', async function () {
      // given
      const query = {
        userId: 1,
      };

      // when
      const url = await adapter.urlForQuery(query, 'training');

      // then
      expect(url.endsWith('/api/users/1/trainings')).to.be.true;
    });

    it('should build the training url if userId is not in the query', async function () {
      // given
      const query = {};

      // when
      const url = await adapter.urlForQuery(query, 'training');

      // then
      expect(url.endsWith('/api/trainings')).to.be.true;
    });
  });
});
