import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization-import-detail', function (hooks) {
  setupTest(hooks);
  module('#hasError', function () {
    ['UPLOAD_ERROR', 'VALIDATION_ERROR', 'IMPORT_ERROR'].forEach((status) => {
      test('it should return true', function (assert) {
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization-import-detail', {
          status,
          errors: [Symbol('error')],
        });
        assert.ok(model.hasError);
      });
    });
    ['UPLOADED', 'VALIDATED', 'IMPORTED'].forEach((status) => {
      test('it should return false', function (assert) {
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization-import-detail', {
          status,
        });
        assert.notOk(model.hasError);
      });
    });
  });
  module('#hasWarning', function () {
    test('it should return true', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        errors: [Symbol('warning')],
      });
      assert.ok(model.hasWarning);
    });
    test('it should return false', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
      });
      assert.notOk(model.hasWarning);
    });
  });
  module('#isDone', function () {
    test('it should return true', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
      });
      assert.ok(model.isDone);
    });
    ['UPLOADED', 'VALIDATED', 'UPLOAD_ERROR', 'VALIDATION_ERROR', 'IMPORT_ERROR'].forEach((status) => {
      test('it should return false', function (assert) {
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization-import-detail', {
          status,
        });
        assert.notOk(model.isDone);
      });
    });
  });
  module('inProgress', function () {
    ['UPLOADED', 'VALIDATED'].forEach((status) => {
      test('it should return true', function (assert) {
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization-import-detail', {
          status,
        });
        assert.ok(model.inProgress);
      });
    });
    ['UPLOAD_ERROR', 'VALIDATION_ERROR', 'IMPORT_ERROR', 'IMPORTED'].forEach((status) => {
      test('it should return false', function (assert) {
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization-import-detail', {
          status,
        });
        assert.notOk(model.inProgress);
      });
    });
  });
});
