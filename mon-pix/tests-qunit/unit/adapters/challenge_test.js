import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | challenge', function (hooks) {
  setupTest(hooks);

  module('#urlForQueryRecord', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:challenge');
      adapter.ajax = sinon.stub().resolves();
    });

    test('should build get next challenge url', async function (assert) {
      // when
      const query = { assessmentId: 1 };
      const url = await adapter.urlForQueryRecord(query, 'challenge');

      // then
      assert.equal(query.assessmentId, undefined);
      assert.true(url.endsWith('/assessments/1/next'));
    });
  });
});
