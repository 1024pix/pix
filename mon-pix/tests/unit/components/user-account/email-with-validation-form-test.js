import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | user-account | email-with-validation-form', function() {
  setupTest();

  context('#onSubmit', function() {
    it('should send new email and password', async function() {
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
    });

    it('should not send new email and password when form is not valid', async function() {
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
    });

    it('should prevent double clicking on submit', async function() {
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
      await component.onSubmit();

      // then
      sinon.assert.calledOnce(sendNewEmail);
    });
  });
});
