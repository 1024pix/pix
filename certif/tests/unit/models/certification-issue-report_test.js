import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import map from 'lodash/map';
import find from 'lodash/find';

import {
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  categoryToLabel,
  subcategoryToLabel,
  categoryToCode,
  subcategoryToCode,
} from 'pix-certif/models/certification-issue-report';

module('Unit | Model | certification issue report', function (hooks) {
  setupTest(hooks);

  const featureToggles = {
    isCertificationFreeFieldsDeletionEnabled: true,
  };

  hooks.beforeEach(function () {
    class FeatureTogglesStub extends Service {
      featureToggles = featureToggles;
    }
    this.owner.register('service:feature-toggles', FeatureTogglesStub);
  });

  hooks.afterEach(function () {
    featureToggles.isCertificationFreeFieldsDeletionEnabled = true;
  });

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

  test('it should return the right label for the subcategory when FT enabled', function (assert) {
    const expectedAssertNumber = 12;
    assert.expect(expectedAssertNumber);
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

  test('it should return the right label for the subcategory FILE_NOT_OPENING when FT disabled', function (assert) {
    featureToggles.isCertificationFreeFieldsDeletionEnabled = false;
    // given
    const store = this.owner.lookup('service:store');

    const models = map(certificationIssueReportSubcategories, (subcategory) => {
      return run(() => store.createRecord('certification-issue-report', { subcategory }));
    });
    const fileNotOpeningModel = find(models, (m) => m.subcategory === 'FILE_NOT_OPENING');

    // when / then
    assert.strictEqual(fileNotOpeningModel.subcategoryLabel, "Le fichier à télécharger ne s'ouvre pas");
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
    const expectedAssertNumber = 12;
    assert.expect(expectedAssertNumber);
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
});
