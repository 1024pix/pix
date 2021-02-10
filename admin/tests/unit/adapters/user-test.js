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

  module('#updateRecord', function(hooks) {

    hooks.beforeEach(function() {
      sinon.stub(adapter, 'ajax').resolves();
    });

    hooks.afterEach(function() {
      adapter.ajax.restore();
    });

    module('when disableUser adapterOptions is passed', function() {

      test('should send a POST request to user disable endpoint', async function(assert) {
        // given
        const expectedUrl = 'http://localhost:3000/api/admin/users/123/disable';
        const adapterOptions = { disableUser: true };

        // when
        await adapter.updateRecord(
          null,
          { modelName: 'user' },
          { id: 123, adapterOptions },
        );

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });

    module('when dissociate adapterOptions is passed', function() {

      test('should send a PATCH request to user dissociate endpoint', async function(assert) {
        // given
        const expectedUrl = 'http://localhost:3000/api/admin/users/123/dissociate';
        const adapterOptions = { dissociate: true };

        // when
        await adapter.updateRecord(
          null,
          { modelName: 'user' },
          { id: 123, adapterOptions },
        );

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });

});
