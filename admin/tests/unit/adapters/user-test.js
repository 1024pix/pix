import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | user', function(hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:user');
  });

  module('#urlForFindRecord', function() {
    test('should add /admin inside the default find record url', function(assert) {
      // when
      const url = adapter.urlForFindRecord(123, 'users');

      // then
      assert.ok(url.endsWith('/admin/users/123'));
    });
  });

  module('#urlForUpdateRecord', function() {
    test('should add /admin inside the default update record url', function(assert) {
      // when
      const url = adapter.urlForUpdateRecord(123);

      // then
      assert.ok(url.endsWith('/admin/users/123'));
    });
  });

  module('#updateRecord', function() {

    module('when anonymizeUser adapterOptions is passed', function(hooks) {

      hooks.beforeEach(function() {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(function() {
        adapter.ajax.restore();
      });

      test('should send a POST request to user endpoint', async function(assert) {
        // given
        adapter.ajax.resolves();

        // when
        await adapter.updateRecord(null, { modelName: 'user' }, { id: 123, adapterOptions: { anonymizeUser: true } });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/users/123/anonymize', 'POST');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
