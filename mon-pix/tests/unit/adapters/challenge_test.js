import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | challenge', function (hooks) {
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
      assert.notOk(query.assessmentId);
      assert.equal(url.endsWith('/assessments/1/next'), true);
    });
  });
});
