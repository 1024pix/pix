import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | password-reset-demand-form', function (hooks) {
  setupTest(hooks);

  let component;
  const sentEmail = 'dumb@people.com';
  let createRecordStub, saveStub;

  module('#savePasswordResetDemand', function (hooks) {
    hooks.beforeEach(function () {
      saveStub = sinon.stub().resolves();
      createRecordStub = sinon.stub().resolves({
        save: saveStub,
      });

      component = createGlimmerComponent('component:password-reset-demand-form');
      component.store = Service.create({
        createRecord: createRecordStub,
      });
      component.email = sentEmail;
    });

    test('should not call api if the user did not enter any email', async function (assert) {
      // when
      component.email = undefined;
      await component.savePasswordResetDemand();

      // then
      assert.expect(0);
      sinon.assert.notCalled(createRecordStub);
    });

    test('should create a passwordResetDemand Record', async function (assert) {
      // when
      await component.savePasswordResetDemand();

      // then
      assert.expect(0);
      sinon.assert.called(createRecordStub);
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: sentEmail });
    });

    test('should save email without spaces', async function (assert) {
      // given
      const emailWithSpaces = '    user@example.net   ';
      component.email = emailWithSpaces;
      const expectedEmail = emailWithSpaces.trim();

      // when
      await component.savePasswordResetDemand();

      // then
      assert.expect(0);
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: expectedEmail });
    });

    test('should save the password reset demand', async function (assert) {
      // when
      await component.savePasswordResetDemand();

      // then
      assert.expect(0);
      sinon.assert.called(saveStub);
    });

    test('should display success message when save resolves', async function (assert) {
      // when
      await component.savePasswordResetDemand();

      // then
      assert.true(component.hasSucceeded);
      assert.false(component.hasFailed);
    });
  });
});
