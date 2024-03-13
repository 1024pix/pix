import { setupTest } from 'ember-qunit';
import map from 'lodash/map';
import {
  categoryToCode,
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';

module('Unit | Model | certification issue report', function (hooks) {
  setupTest(hooks);

  test('it should return the right label for the category', function (assert) {
    const expectedAssertNumber = Object.keys(certificationIssueReportCategories).length;
    assert.expect(expectedAssertNumber);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) =>
      store.createRecord('certification-issue-report', { category }),
    );

    // when / then
    for (const model of models) {
      assert.strictEqual(model.categoryLabel, categoryToLabel[model.category]);
    }
  });

  test('it should return the right label for the subcategory', function (assert) {
    const expectedAssertNumber = Object.keys(certificationIssueReportSubcategories).length;
    assert.expect(expectedAssertNumber);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) =>
      store.createRecord('certification-issue-report', { subcategory }),
    );

    // when / then
    for (const model of models) {
      assert.strictEqual(model.subcategoryLabel, subcategoryToLabel[model.subcategory]);
    }
  });

  test('it should return the right code for the category', function (assert) {
    const expectedAssertNumber = Object.keys(certificationIssueReportCategories).length;
    assert.expect(expectedAssertNumber);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) =>
      store.createRecord('certification-issue-report', { category }),
    );

    // when / then
    for (const model of models) {
      assert.strictEqual(model.categoryCode, categoryToCode[model.category]);
    }
  });

  test('it should return the right code for the subcategory', function (assert) {
    const expectedAssertNumber = Object.keys(certificationIssueReportSubcategories).length;
    assert.expect(expectedAssertNumber);
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) =>
      store.createRecord('certification-issue-report', { subcategory }),
    );

    // when / then
    for (const model of models) {
      assert.strictEqual(model.subcategoryCode, subcategoryToCode[model.subcategory]);
    }
  });

  test('it should return an empty string label when subcategory is null', function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const model = store.createRecord('certification-issue-report', { subcategory: null });

    // when / then
    assert.strictEqual(model.subcategoryLabel, '');
  });
});
