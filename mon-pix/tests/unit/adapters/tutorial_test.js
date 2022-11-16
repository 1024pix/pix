import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | Tutorial', function () {
  setupTest();

  describe('#urlForQuery', function () {
    let adapter;

    beforeEach(function () {
      adapter = this.owner.lookup('adapter:tutorial');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build the tutorial url if no type in query', async function () {
      // when
      const query = {};
      const url = await adapter.urlForQuery(query, 'tutorial');

      // then
      expect(url.endsWith('/tutorials')).to.be.true;
    });

    it('should build the tutorial type url', async function () {
      // when
      const query = { userId: '123' };
      const url = await adapter.urlForQuery(query, 'tutorial');

      // then
      expect(url.endsWith('users/123/tutorials')).to.be.true;
    });
  });
});
