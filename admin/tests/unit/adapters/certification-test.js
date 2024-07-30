import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | certification', function (hooks) {
  setupTest(hooks);

  let adapter;
  let store;
  let serializer;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification');
    store = this.owner.lookup('service:store');
    sinon.stub(adapter, 'ajax');
    sinon.stub(store, 'serializerFor');
    serializer = { serializeIntoHash: sinon.stub() };
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#urlForFindRecord', function () {
    test('should build get url from certification id', function (assert) {
      // when
      const url = adapter.urlForFindRecord(123, 'certification');

      // then
      assert.ok(url.endsWith('/admin/certifications/123'));
    });
  });

  module('#urlForUpdateJuryComment', function () {
    test('should build update jury comment url from certification course id', function (assert) {
      // when
      const url = adapter.urlForUpdateJuryComment(1001);

      // then
      assert.ok(url.endsWith('/admin/certification-courses/1001/assessment-results'));
    });
  });

  module('#urlForUpdateRecord', function () {
    test('should build update url from certification details id', function (assert) {
      // when
      const url = adapter.urlForUpdateRecord(123, 'certification');

      // then
      assert.ok(url.endsWith('/certification-courses/123'));
    });
  });

  module('#updateRecord', function () {
    module('when updateJuryComment adapter option passed', function () {
      test('it should trigger an ajax call with the updateJuryComment url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForUpdateJuryComment')
          .returns('https://example.net/api/admin/certification-courses/123/assessment-results');
        const store = Symbol();
        const attributes = {
          'comment-by-jury': 'comment by jury',
        };

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { updateJuryComment: true },
            serialize: sinon.stub().returns({ data: { attributes } }),
          },
        );

        // then
        const expectedPayload = {
          data: {
            data: {
              attributes: {
                'comment-by-jury': 'comment by jury',
              },
            },
          },
        };
        assert.ok(
          adapter.ajax.calledWith(
            'https://example.net/api/admin/certification-courses/123/assessment-results',
            'POST',
            expectedPayload,
          ),
        );
      });
    });

    module('when no adapter options is passed', function () {
      test('it should trigger an ajax call with the appropriate url, data and method', async function (assert) {
        // given
        adapter.ajax.resolves();
        store.serializerFor.returns(serializer);
        serializer.serializeIntoHash.callsFake((data) => {
          data.data = {};
          data.data.attributes = {};
        });

        // when
        await adapter.updateRecord(store, { modelName: 'someModelName' }, { id: 123, adapterOptions: {} });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/certification-courses/123', 'PATCH');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });

  module('#buildURL', function () {
    test('it should build specific URL when requestType is "cancel"', function (assert) {
      // when
      const url = adapter.buildURL('not_used', 123, 'not_used', 'cancel', 'not_used');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/certification-courses/123/cancel');
    });

    test('it should build specific URL when requestType is "uncancel"', function (assert) {
      // when
      const url = adapter.buildURL('not_used', 123, 'not_used', 'uncancel', 'not_used');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/certification-courses/123/uncancel');
    });

    test('it should build specific URL when requestType is "reject"', function (assert) {
      // when
      const url = adapter.buildURL('not_used', 123, 'not_used', 'reject', 'not_used');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/certification-courses/123/reject');
    });

    test('it should build specific URL when requestType is "unreject"', function (assert) {
      // when
      const url = adapter.buildURL('not_used', 123, 'not_used', 'unreject', 'not_used');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/certification-courses/123/unreject');
    });

    test('it should build specific URL when requestType is "edit-jury-level"', function (assert) {
      // when
      const url = adapter.buildURL('not_used', 'not_used', 'not_used', 'edit-jury-level', 'not_used');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/complementary-certification-course-results');
    });
  });
});
