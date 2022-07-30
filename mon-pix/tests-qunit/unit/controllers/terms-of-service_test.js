import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | terms-of-service', function (hooks) {
  setupTest(hooks);
  let controller;

  module('#action submit', function () {
    hooks.beforeEach(function () {
      controller = this.owner.lookup('controller:terms-of-service');
      controller.transitionToRoute = sinon.stub();
      controller.currentUser = { user: { save: sinon.stub().resolves() } };
    });

    test('it should save the acceptance date of the last terms of service', async function (assert) {
      // when
      controller.isTermsOfServiceValidated = true;
      controller.showErrorTermsOfServiceNotSelected = false;

      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.currentUser.user.save, { adapterOptions: { acceptPixTermsOfService: true } });
      sinon.assert.calledWith(controller.transitionToRoute, '');
      assert.false(controller.showErrorTermsOfServiceNotSelected);
    });

    test('it should show an error to user to validate terms of service ', async function (assert) {
      // when
      controller.isTermsOfServiceValidated = false;
      controller.showErrorTermsOfServiceNotSelected = false;
      await controller.send('submit');

      // then
      assert.true(controller.showErrorTermsOfServiceNotSelected);
    });
  });
});
