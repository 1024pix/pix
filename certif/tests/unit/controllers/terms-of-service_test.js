import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | terms-of-service', function (hooks) {
  setupTest(hooks);
  let controller;

  module('#action submit', function (hooks) {
    hooks.beforeEach(function () {
      controller = this.owner.lookup('controller:terms-of-service');
      sinon.stub(controller.router, 'transitionTo');
      controller.router.transitionTo.resolves();
      controller.currentUser = { certificationPointOfContact: { save: sinon.stub().resolves() } };
    });

    test('it should save acceptance of terms of service', async function (assert) {
      // when
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.currentUser.certificationPointOfContact.save, {
        adapterOptions: { acceptPixCertifTermsOfService: true },
      });
      assert.ok(controller);
    });

    test('it should transition to authenticated.sessions.list', async function (assert) {
      // when
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.router.transitionTo, 'authenticated.sessions.list');
      assert.ok(controller);
    });

    module('when an error occurs', function () {
      test('it should display a notification error', async function (assert) {
        // given
        controller.notifications = { error: sinon.stub() };
        controller.intl = { t: sinon.stub() };
        controller.currentUser = { certificationPointOfContact: { save: sinon.stub().rejects() } };

        // when
        await controller.send('submit');

        // then
        sinon.assert.calledOnce(controller.notifications.error);
        assert.ok(controller);
      });
    });
  });
});
