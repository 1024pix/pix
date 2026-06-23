import { setupTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

module('Unit | Model | framework-history', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasDraft', function () {
    test('it should return true when there is a draft version', function (assert) {
      // given
      store.createRecord('certification-version', { id: 12, status: 'DRAFT' });
      const frameworkHistory = store.createRecord('framework-history', {
        history: [
          {
            id: 12,
            status: 'DRAFT',
          },
        ],
      });

      assert.true(frameworkHistory.hasDraft);
    });
    test('it should return false when there is no draft version', function (assert) {
      // given
      store.createRecord('certification-version', { id: 13, status: 'ACTIVE' });
      const frameworkHistory = store.createRecord('framework-history', {
        history: [
          {
            id: 13,
            status: 'ACTIVE',
          },
        ],
      });

      assert.false(frameworkHistory.hasDraft);
    });
  });

  module('#activeHistory', function () {
    test('it should return the activeHistory when there is an active version', function (assert) {
      // given
      store.createRecord('certification-version', { id: 12, status: 'ACTIVE' });
      const frameworkHistory = store.createRecord('framework-history', {
        history: [
          {
            id: 12,
            status: 'ACTIVE',
          },
        ],
      });

      assert.deepEqual(frameworkHistory.activeHistory, {
        id: 12,
        status: 'ACTIVE',
      });
    });
    test('it should return null when there is an active version', function (assert) {
      // given
      store.createRecord('certification-version', { id: 13, status: 'DRAFT' });
      const frameworkHistory = store.createRecord('framework-history', {
        history: [
          {
            id: 13,
            status: 'DRAFT',
          },
        ],
      });

      assert.strictEqual(frameworkHistory.activeHistory, null);
    });
  });
});
