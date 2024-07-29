import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | badge-criterion', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:badge-criterion');
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from badgeId', async function (assert) {
      // when
      const badgeCriterion = {
        belongsTo(relationship) {
          if (relationship !== 'badge') return null;
          return { id: 90 };
        },
      };
      const url = await adapter.urlForCreateRecord('badge-criterion', badgeCriterion);

      // then
      assert.true(url.endsWith('/api/admin/badges/90/badge-criteria'));
    });
  });

  module('#updateRecord', function () {
    test('should trigger an ajax call with the right method and payload', function (assert) {
      // given
      const attributes = {
        scope: Symbol('should-be-removed'),
        name: 'Dummy name',
        threshold: 12,
        'capped-tubes': [],
      };

      const snapshot = {
        id: 123,
        serialize: sinon.stub().returns({
          data: {
            attributes,
          },
        }),
      };

      // when
      adapter.ajax = sinon.stub();

      adapter.updateRecord(null, { modelName: 'badge-criterion' }, snapshot);

      // then
      const expectedPayload = {
        data: {
          data: {
            attributes: {
              name: 'Dummy name',
              threshold: 12,
              'capped-tubes': [],
            },
          },
        },
      };

      sinon.assert.calledWithExactly(
        adapter.ajax,
        'http://localhost:3000/api/admin/badge-criteria/123',
        'PATCH',
        expectedPayload,
      );
      assert.ok(adapter);
    });
  });
});
