import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | Module | Passage', function (hooks) {
  setupTest(hooks);

  module('#terminate', function () {
    test('should trigger an ajax call with the right url and method', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const passage = store.createRecord('passage', { id: '123' });
      const adapter = this.owner.lookup('adapter:passage');
      sinon.stub(adapter, 'ajax').resolves();
      const expectedUrl = `http://localhost:3000/api/passages/${passage.id}/terminate`;

      // when
      await adapter.terminate({ passageId: passage.id });

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST');
      assert.ok(true);
    });
  });
});
