import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | tutorial-evaluation', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:tutorial-evaluation');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#createRecord', () => {
    it('should call API to create a tutorial-evaluation', async function() {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId } };

      // when
      await adapter.createRecord(null, 'tutorial-evaluation', tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/tutorials/tutorialId/evaluate', 'PUT');
    });

  });

});
