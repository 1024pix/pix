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

  module('#urlForCancelCertification', function () {
    test('should build url for when certification is about to be cancelled', function (assert) {
      // when
      const url = adapter.urlForCancelCertification(123, 'certification');

      // then
      assert.ok(url.endsWith('/certification-courses/123/cancel'));
    });
  });

  module('#urlForUncancelCertification', function () {
    test('should build url for when certification is about to be uncancelled', function (assert) {
      // when
      const url = adapter.urlForUncancelCertification(123, 'certification');

      // then
      assert.ok(url.endsWith('/certification-courses/123/uncancel'));
    });
  });

  module('#urlForRejectCertification', function () {
    test('should build url for when certification is about to be rejected', function (assert) {
      // when
      const url = adapter.urlForRejectCertification(123, 'certification');

      // then
      assert.ok(url.endsWith('/certification-courses/123/reject'));
    });
  });

  module('#urlForUnrejectCertification', function () {
    test('should build url for when certification is about to be unrejected', function (assert) {
      // when
      const url = adapter.urlForUnrejectCertification(123, 'certification');

      // then
      assert.ok(url.endsWith('/certification-courses/123/unreject'));
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

    module('when isCertificationCancel adapter option passed', function () {
      test('it should trigger an ajax call with the isCertificationCancel url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForCancelCertification')
          .returns('https://example.net/api/admin/certification-courses/123/cancel');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { isCertificationCancel: true },
          },
        );

        // then
        assert.ok(adapter.ajax.calledWith('https://example.net/api/admin/certification-courses/123/cancel', 'PATCH'));
      });
    });

    module('when isCertificationUncancel adapter option passed', function () {
      test('it should trigger an ajax call with the isCertificationUncancel url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForUncancelCertification')
          .returns('https://example.net/api/admin/certification-courses/123/uncancel');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { isCertificationUncancel: true },
          },
        );

        // then
        assert.ok(adapter.ajax.calledWith('https://example.net/api/admin/certification-courses/123/uncancel', 'PATCH'));
      });
    });

    module('when isCertificationReject adapter option passed', function () {
      test('it should trigger an ajax call with the isCertificationReject url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForRejectCertification')
          .returns('https://example.net/api/admin/certification-courses/123/reject');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { isCertificationReject: true },
          },
        );

        // then
        assert.ok(adapter.ajax.calledWith('https://example.net/api/admin/certification-courses/123/reject', 'PATCH'));
      });
    });

    module('when isCertificationUnreject adapter option passed', function () {
      test('it should trigger an ajax call with the isCertificationUnreject url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForUnrejectCertification')
          .returns('https://example.net/api/admin/certification-courses/123/unreject');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { isCertificationUnreject: true },
          },
        );

        // then
        assert.ok(adapter.ajax.calledWith('https://example.net/api/admin/certification-courses/123/unreject', 'PATCH'));
      });
    });

    module('when isJuryLevelEdit adapter option passed', function () {
      test('it should trigger an ajax call with the isJuryLevelEdit url, data and method', async function (assert) {
        // given
        sinon
          .stub(adapter, 'urlForEditJuryLevel')
          .returns('https://example.net/api/admin/complementary-certification-course-results');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: {
              isJuryLevelEdit: true,
              juryLevel: 123,
              complementaryCertificationCourseId: 456,
            },
          },
        );

        const expectedPayload = {
          data: {
            data: {
              attributes: {
                juryLevel: 123,
                complementaryCertificationCourseId: 456,
              },
            },
          },
        };

        // then
        assert.ok(
          adapter.ajax.calledWith(
            'https://example.net/api/admin/complementary-certification-course-results',
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
});
