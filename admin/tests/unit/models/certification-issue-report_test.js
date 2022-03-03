import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import map from 'lodash/map';

import {
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  categoryToLabel,
  subcategoryToLabel,
  categoryToCode,
  subcategoryToCode,
} from 'pix-admin/models/certification-issue-report';

module('Unit | Model | certification issue report', function (hooks) {
  setupTest(hooks);

  test('it should return the right label for the category', function (assert) {
    assert.expect(7);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) => {
      return run(() => store.createRecord('certification-issue-report', { category }));
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.categoryLabel, categoryToLabel[model.category]);
    }
  });

  test('it should return the right label for the subcategory', function (assert) {
    assert.expect(13);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return run(() => store.createRecord('certification-issue-report', { subcategory }));
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.subcategoryLabel, subcategoryToLabel[model.subcategory]);
    }
  });

  test('it should return the right code for the category', function (assert) {
    assert.expect(7);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) => {
      return run(() => store.createRecord('certification-issue-report', { category }));
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.categoryCode, categoryToCode[model.category]);
    }
  });

  test('it should return the right code for the subcategory', function (assert) {
    assert.expect(13);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return run(() => store.createRecord('certification-issue-report', { subcategory }));
    });

    // when / then
    for (const model of models) {
      assert.strictEqual(model.subcategoryCode, subcategoryToCode[model.subcategory]);
    }
  });

  test('it should return an empty string label when subcategory is null', function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const model = run(() => store.createRecord('certification-issue-report', { subcategory: null }));

    // when / then
    assert.strictEqual(model.subcategoryLabel, '');
  });
  module('#canBeResolved', function () {
    test('it should return false is the issue is impactful and already resolved', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = run(() =>
        store.createRecord('certification-issue-report', {
          isImpactful: true,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'resolved',
        })
      );

      // when / then
      assert.false(model.canBeResolved);
    });
    test('it should return true is the issue is impactful and not resolved yet', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = run(() =>
        store.createRecord('certification-issue-report', {
          isImpactful: true,
          resolvedAt: null,
          resolution: null,
        })
      );

      // when / then
      assert.true(model.canBeResolved);
    });
  });
});
