import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification-framework', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#get activeVersionStartDate', function () {
    test('returns null when no active version', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'draft',
            startDate: new Date('2024-01-01'),
          }),
        ],
      });

      assert.strictEqual(certificationFramework.activeVersionStartDate, null);
    });

    test('returns the date of the active version when there is one', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'active',
            startDate: new Date('2024-01-01'),
          }),
        ],
      });
      assert.strictEqual(certificationFramework.activeVersionStartDate.getTime(), new Date('2024-01-01').getTime());
    });
  });

  module('#get activeVersionId', function () {
    test('returns null when no active version', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'draft',
          }),
        ],
      });

      assert.strictEqual(certificationFramework.activeVersionId, null);
    });

    test('returns the id of the active version when there is one', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'active',
          }),
          store.createRecord('certification-version-summary', {
            id: 2,
            status: 'draft',
          }),
        ],
      });
      assert.strictEqual(certificationFramework.activeVersionId, '1');
    });
  });

  module('#get hasDraft', function () {
    test('returns true when framework has draft', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'draft',
          }),
          store.createRecord('certification-version-summary', {
            id: 2,
            status: 'archived',
          }),
        ],
      });

      assert.true(certificationFramework.hasDraft);
    });

    test('returns false when framework has no draft', function (assert) {
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
        versionSummaries: [
          store.createRecord('certification-version-summary', {
            id: 1,
            status: 'active',
          }),
          store.createRecord('certification-version-summary', {
            id: 2,
            status: 'archived',
          }),
        ],
      });
      assert.false(certificationFramework.hasDraft);
    });
  });
});
