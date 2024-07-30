import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | feedback-panel', function (hooks) {
  let component;

  setupTest(hooks);

  hooks.beforeEach(function () {
    // given
    component = createGlimmerComponent('feedback-panel');
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
      component.isFormSubmitted = true;

      // when
      component.toggleFeedbackForm();

      // then
      assert.false(component.isExpanded);
      assert.false(component.isFormSubmitted);
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

  module('#toggleModalVisibility', function () {
    test('should set isModalVisible from false to true', function (assert) {
      // given
      component.isModalVisible = false;

      // when
      component.toggleModalVisibility();

      // then
      assert.true(component.isModalVisible);
    });

    test('should set isModalVisible from true to false', function (assert) {
      // given
      component.isModalVisible = true;

      // when
      component.toggleModalVisibility();

      // then
      assert.false(component.isModalVisible);
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

  module('#addComment', function () {
    test('should display a comment input and hide button', async function (assert) {
      // given
      component.displayAddCommentButton = true;

      // when
      component.addComment();

      // then
      assert.false(component.displayAddCommentButton);
    });
  });
});
