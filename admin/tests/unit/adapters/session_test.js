import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | session', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:session');
  });

  module('#urlForQueryRecord', function () {
    test('should add /jury inside the default query url', function (assert) {
      // when
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('/admin/sessions'));
    });
  });

  module('#urlForFindRecord', function () {
    test('should add /jury inside the default find record url', function (assert) {
      // when
      const url = adapter.urlForFindRecord(123, 'sessions');

      // then
      assert.ok(url.endsWith('/admin/sessions/123'));
    });
  });

  module('#urlForUpdateMarks', function () {
    test('should add /admin inside the default update record url', function (assert) {
      // when
      const url = adapter.urlForUpdateRecord(123);

      // then
      assert.ok(url.endsWith('/admin/sessions/123'));
    });
  });

  module('#updateRecord', function () {
    module('when updatePublishedCertification adapterOption is passed', function () {
      test('should send a patch request to /publish', function (assert) {
        // when
        const snapshot = { id: 123, adapterOptions: { updatePublishedCertifications: true, toPublish: true } };
        adapter.ajax = sinon.stub();

        adapter.updateRecord(null, { modelName: 'session' }, snapshot);

        // then
        sinon.assert.calledWithExactly(adapter.ajax, 'http://localhost:3000/api/admin/sessions/123/publish', 'PATCH');
        assert.ok(adapter);
      });

      test('should send a patch request to /unpublish', function (assert) {
        // when
        const snapshot = { id: 123, adapterOptions: { updatePublishedCertifications: true, toPublish: false } };
        adapter.ajax = sinon.stub();

        adapter.updateRecord(null, { modelName: 'session' }, snapshot);

        // then
        sinon.assert.calledWithExactly(adapter.ajax, 'http://localhost:3000/api/admin/sessions/123/unpublish', 'PATCH');
        assert.ok(adapter);
      });
    });

    module('when certificationOfficerAssignment adapterOption passed', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(function () {
        adapter.ajax.restore();
      });

      test('should send a patch request to user assignment endpoint', async function (assert) {
        // given
        adapter.ajax.resolves();

        // when
        await adapter.updateRecord(
          null,
          { modelName: 'session' },
          { id: 123, adapterOptions: { certificationOfficerAssignment: true } },
        );

        // then
        sinon.assert.calledWith(
          adapter.ajax,
          'http://localhost:3000/api/admin/sessions/123/certification-officer-assignment',
          'PATCH',
        );
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });

    module('when unfinalize adapterOption passed', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(function () {
        adapter.ajax.restore();
      });

      test('should send a patch request to unfinalize a session', async function (assert) {
        // given
        adapter.ajax.resolves();

        // when
        await adapter.updateRecord(null, { modelName: 'session' }, { id: 123, adapterOptions: { unfinalize: true } });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/sessions/123/unfinalize', 'PATCH');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
