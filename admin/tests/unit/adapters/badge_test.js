import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | badge', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:badge');
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from targetProfileId', async function (assert) {
      // when
      const options = { adapterOptions: { targetProfileId: 788 } };
      const url = await adapter.urlForCreateRecord('badge', options);

      // then
      assert.true(url.endsWith('/api/admin/target-profiles/788/badges'));
    });
  });

  module('#updateRecord', function () {
    test('should trigger an ajax call with the right method and payload', function (assert) {
      // given
      const updatedBadgeData = {
        key: 'dummy-key',
        title: 'Dummy title',
        message: 'dummy message',
        'image-url': 'dummy.svg',
        'alt-message': 'gummy alt message',
        'is-certifiable': true,
        'is-always-visible': true,
      };

      const expectedPayload = {
        data: {
          data: {
            attributes: { ...updatedBadgeData },
          },
        },
      };

      const snapshot = {
        id: 99,
        serialize: sinon.stub().returns({
          data: {
            attributes: {
              ...updatedBadgeData,
              'campaign-threshold': Symbol('should-be-removed'),
              'capped-tubes-criteria': Symbol('should-be-removed'),
            },
          },
        }),
      };

      adapter.ajax = sinon.stub();

      // when
      adapter.updateRecord(null, { modelName: 'badge' }, snapshot);

      // then
      sinon.assert.calledWithExactly(
        adapter.ajax,
        'http://localhost:3000/api/admin/badges/99',
        'PATCH',
        expectedPayload,
      );
      assert.ok(adapter);
    });
  });
});
