import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | feedback-panel', function (hooks) {
  let component;

  setupTest(hooks);

  hooks.beforeEach(function () {
    // given
    component = createGlimmerComponent('component:feedback-panel');
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
      component.emptyTextBoxMessageError = '10, 9, 8, ...';
      component.isFormSubmitted = true;

      // when
      component.toggleFeedbackForm();

      // then
      assert.false(component.isExpanded);
      assert.false(component.isFormSubmitted);
      assert.notOk(component.emptyTextBoxMessageError);
    });
  });

  module('#isSendButtonDisabled', function () {
    test('should return false when the feedback has not already been sent', function (assert) {
      // given
      component._sendButtonStatus = 'unrecorded';

      // when
      const result = component.isSendButtonDisabled;

      // then
      assert.false(result);
    });

    test('should return false when the feedback has already been sent', function (assert) {
      // given
      component._sendButtonStatus = 'recorded';

      // when
      const result = component.isSendButtonDisabled;

      // then
      assert.false(result);
    });

    test('should return true when the send operation is in progress', function (assert) {
      // given
      component._sendButtonStatus = 'pending';

      // when
      const result = component.isSendButtonDisabled;

      // then
      assert.true(result);
    });
  });

  module('#sendFeedback', function (hooks) {
    let feedback;
    let store;

    hooks.beforeEach(function () {
      feedback = {
        save: sinon.stub().resolves(null),
      };
      store = {
        createRecord: sinon.stub().returns(feedback),
      };
    });

    test('should re-initialise the form correctly', async function (assert) {
      // given
      component._category = 'CATEGORY';
      component.content = 'TEXT';
      component.store = store;

      // when
      await component.sendFeedback();

      // then
      assert.notOk(component._category);
      assert.notOk(component.content);
      assert.notOk(component.nextCategory);
    });
  });
});
