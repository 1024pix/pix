import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | certification-candidate', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-candidate');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from certification-candidate id', async function (assert) {
      // when
      const options = { adapterOptions: {} };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.true(url.endsWith('/certification-candidates'));
    });

    test('should redirect to session/id/certification-candidate/participation', async function (assert) {
      // when
      const options = { adapterOptions: { joinSession: true, sessionId: 456 } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.true(url.endsWith('/sessions/456/candidate-participation'));
    });
  });
});
