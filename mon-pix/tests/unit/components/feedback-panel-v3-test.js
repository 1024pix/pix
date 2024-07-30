import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';

module('Unit | Component | feedback-panel-v3', function (hooks) {
  let component;

  setupTest(hooks);

  hooks.beforeEach(function () {
    // given
    component = createGlimmerComponent('feedback-panel-v3');
  });

  module('#toggleFeedbackForm', function () {
    test('should open form', function (assert) {
      // when
      component.toggleFeedbackForm();

      // then
      assert.true(component.isExpanded);
    });

    test('should close and reset form', function (assert) {
      // given
      component.isExpanded = true;

      // when
      component.toggleFeedbackForm();

      // then
      assert.false(component.isExpanded);
    });
  });
});
