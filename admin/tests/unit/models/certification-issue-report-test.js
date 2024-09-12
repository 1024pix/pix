import { setupTest } from 'ember-qunit';
import map from 'lodash/map';
import {
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToLabel,
} from 'pix-admin/models/certification-issue-report';
import { module, test } from 'qunit';

module('Unit | Model | certification issue report', function (hooks) {
  setupTest(hooks);

  test('it should return the right label for the category', function (assert) {
    assert.expect(10);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) => {
      return store.createRecord('certification-issue-report', { category });
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.categoryLabel, categoryToLabel[model.category]);
    }
  });

  test('it should return the right label for the subcategory', function (assert) {
    assert.expect(16);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return store.createRecord('certification-issue-report', { subcategory });
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.subcategoryLabel, subcategoryToLabel[model.subcategory]);
    }
  });

  test('it should return an empty string label when subcategory is null', function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const model = store.createRecord('certification-issue-report', { subcategory: null });

    // when / then
    assert.strictEqual(model.subcategoryLabel, '');
  });
  module('#canBeResolved', function () {
    test('it should return false if the issue is impactful and already resolved', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date('2020-01-01'),
        resolution: 'resolved',
      });

      // when / then
      assert.false(model.canBeResolved);
    });
    test('it should return true if the issue is impactful and not resolved yet', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: null,
        resolution: null,
      });

      // when / then
      assert.true(model.canBeResolved);
    });
  });

  module('#canBeModified', function () {
    module('when the issue is impactful', function () {
      module('when the issue is not resolved', function () {
        test('it should return false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const model = store.createRecord('certification-issue-report', {
            isImpactful: true,
            resolvedAt: null,
            resolution: null,
          });
          // when / then
          assert.false(model.canBeModified);
        });
      });

      module('when the issue is resolved', function () {
        test('it should return true', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const model = store.createRecord('certification-issue-report', {
            isImpactful: true,
            resolvedAt: new Date(),
            resolution: 'resolved',
          });
          // when / then
          assert.true(model.canBeModified);
        });
      });
    });

    module('when the issue is not impactful', function () {
      module('when the issue is not resolved', function () {
        test('it should return false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const model = store.createRecord('certification-issue-report', {
            isImpactful: false,
            resolvedAt: null,
            resolution: null,
          });
          // when / then
          assert.false(model.canBeModified);
        });
      });

      module('when the issue is resolved', function () {
        test('it should return false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const model = store.createRecord('certification-issue-report', {
            isImpactful: false,
            resolvedAt: new Date(),
            resolution: 'resolved',
          });
          // when / then
          assert.false(model.canBeModified);
        });
      });
    });
  });
});
