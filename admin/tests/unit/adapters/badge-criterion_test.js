import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

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
});
