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

module('Unit | Model | certification issue report', function(hooks) {
  setupTest(hooks);

  test('it should return the right label for the category', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) => {
      return run(() => store.createRecord('certification-issue-report', { category }));
    });

    // when / then
    for (const model of models) {
      assert.equal(model.categoryLabel, categoryToLabel[model.category]);
    }
  });

  test('it should return the right label for the subcategory', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return run(() => store.createRecord('certification-issue-report', { subcategory }));
    });

    // when / then
    for (const model of models) {
      assert.equal(model.subcategoryLabel, subcategoryToLabel[model.subcategory]);
    }
  });

  test('it should return the right code for the category', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportCategories, (category) => {
      return run(() => store.createRecord('certification-issue-report', { category }));
    });

    // when / then
    for (const model of models) {
      assert.equal(model.categoryCode, categoryToCode[model.category]);
    }
  });

  test('it should return the right code for the subcategory', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return run(() => store.createRecord('certification-issue-report', { subcategory }));
    });

    // when / then
    for (const model of models) {
      assert.equal(model.subcategoryCode, subcategoryToCode[model.subcategory]);
    }
  });

  test('it should return an empty string label when subcategory is null', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const model = run(() => store.createRecord('certification-issue-report', { subcategory: null }));

    // when / then
    assert.equal(model.subcategoryLabel, '');
  });

});
