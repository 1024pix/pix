import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | ImportBanner', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:import-banner');
  });
  module('get#displayBanner', () => {
    test('should return false if nor', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: false,
        inProgress: false,
        hasError: false,
        isLoading: false,
      };

      // then
      assert.false(component.displayBanner);
    });
    ['hasError', 'hasWarning', 'inProgress'].forEach((key) => {
      test(`should return true when import ${key} is true`, (assert) => {
        //when
        component.args.organizationImportDetail = {
          [key]: true,
        };

        // then
        assert.true(component.displayBanner);
      });
    });
    test(`should return true when isLoading is true`, (assert) => {
      //when
      component.args.isLoading = true;

      // then
      assert.true(component.displayBanner);
    });
    test('should return false if organizationImportDetail is null and isLoading is false', (assert) => {
      //when
      component.args.organizationImportDetail = null;
      component.args.isLoading = false;

      // then
      assert.false(component.displayBanner);
    });
    test('should return true if import is done with warnings', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: true,
        isDone: false,
      };

      // then
      assert.true(component.displayBanner);
    });
  });

  module('get#bannerType', () => {
    test('shoud return information when there is no warning', (assert) => {
      // when
      component.args.organizationImportDetail = { hasWarning: false };
      // then
      assert.strictEqual(component.bannerType, 'information');
    });
    test('shoud return warning when there is warning', (assert) => {
      // when
      component.args.organizationImportDetail = { hasWarning: true };
      // then
      assert.strictEqual(component.bannerType, 'warning');
    });
    test('should return error when there is error', (assert) => {
      component.args.organizationImportDetail = { hasError: true };
      assert.strictEqual(component.bannerType, 'error');
    });
  });

  module('get#displaySuccess', () => {
    test('should return true if organizationImportDetail is finish', (assert) => {
      component.args.organizationImportDetail = { isDone: true };
      assert.true(component.displaySuccess);
    });
    test('should return false if organizationImportDetail is not finish', (assert) => {
      component.args.organizationImportDetail = { isDone: false };
      assert.false(component.displaySuccess);
    });
  });
});
