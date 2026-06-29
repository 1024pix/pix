import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | admin-organization-learner', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:admin-organization-learner');
    sinon.stub(adapter, 'ajax');
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#urlForQuery', function () {
    test('should return api endpoint url for admin-organization-learner', function (assert) {
      // when
      const query = {
        page: {
          number: 1,
          size: 50,
        },
      };
      const url = adapter.urlForQuery(query);

      // then
      assert.ok(url.endsWith('/admin/organization-learners'));
    });
  });
});
