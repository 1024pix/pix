import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user-tutorial', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:tutorial');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#findAll', () => {
    it('should call API to find related tutorials', async function() {
      // when
      await adapter.findAll('tutorial');

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me/tutorials', 'GET');
    });
  });

});
