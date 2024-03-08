import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Trainings::StateTag', function (hooks) {
  setupTest(hooks);

  module('When isDisabled is true', function (hooks) {
    let component;
    hooks.beforeEach(() => {
      component = createComponent('component:trainings/state-tag', {
        isDisabled: true,
      });
    });

    module('#color', function () {
      test('color should be "error"', function (assert) {
        // then
        assert.strictEqual(component.color, 'error');
      });
    });

    module('#content', function () {
      test('content should be "En pause"', function (assert) {
        // then
        assert.strictEqual(component.content, 'En pause');
      });
    });
  });
  module('When isDisabled is false', function (hooks) {
    let component;
    hooks.beforeEach(() => {
      component = createComponent('component:trainings/state-tag', {
        isDisabled: false,
      });
    });

    module('#color', function () {
      test('color should be "primary"', function (assert) {
        // then
        assert.strictEqual(component.color, 'primary');
      });
    });

    module('#content', function () {
      test('content should be "Actif"', function (assert) {
        // then
        assert.strictEqual(component.content, 'Actif');
      });
    });
  });
});
