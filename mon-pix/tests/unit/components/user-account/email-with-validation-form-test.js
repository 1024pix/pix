import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | user-account | email-with-validation-form', function (hooks) {
  setupTest(hooks);

  module('#validateNewEmail', function () {
    test('should trim on email validation', function (assert) {
      // given
      const emailWithSpaces = '   lea@example.net   ';
      const component = createGlimmerComponent('component:user-account/email-with-validation-form');

      // when
      component.validateNewEmail({ target: { value: emailWithSpaces } });

      // then
      assert.strictEqual(component.newEmail, emailWithSpaces.trim());
    });
  });

  module('#onSubmit', function () {
    test('should send new email and password', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-with-validation-form');
      const newEmail = 'toto@example.net';
      const password = 'pix123';
      const sendNewEmail = sinon.stub();
      component.store = { createRecord: () => ({ sendNewEmail }) };
      component.newEmail = newEmail;
      component.password = password;
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmit();

      // then
      sinon.assert.calledWith(component.store.createRecord, 'email-verification-code', { password, newEmail });
      sinon.assert.calledOnce(sendNewEmail);
      assert.ok(true);
    });

    test('should not send new email and password when form is not valid', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-with-validation-form');
      const sendNewEmail = sinon.stub();
      component.store = { createRecord: () => ({ sendNewEmail }) };
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmit();

      // then
      sinon.assert.notCalled(component.store.createRecord);
      sinon.assert.notCalled(sendNewEmail);
      assert.ok(true);
    });

    test('should prevent double clicking on submit', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-with-validation-form');
      const newEmail = 'toto@example.net';
      const password = 'pix123';
      const sendNewEmail = sinon.stub();
      component.store = { createRecord: () => ({ sendNewEmail }) };
      component.newEmail = newEmail;
      component.password = password;
      sinon.spy(component.store, 'createRecord');

      // when
      component.onSubmit();
      await component.onSubmit();

      // then
      sinon.assert.calledOnce(sendNewEmail);
      assert.ok(true);
    });
  });
});
