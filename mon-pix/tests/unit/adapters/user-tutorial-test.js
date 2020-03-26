import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user-tutorial', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:user-tutorial');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#createRecord', () => {
    it('should call API to create a user-tutorial', async function() {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId } };

      // when
      await adapter.createRecord(null, 'user-tutorial', tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me/tutorials/tutorialId', 'PUT');
    });
  });

});
