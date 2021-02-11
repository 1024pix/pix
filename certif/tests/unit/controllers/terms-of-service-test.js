import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | terms-of-service', function(hooks) {
  setupTest(hooks);
  let controller;

  module('#action submit', function(hooks) {

    hooks.beforeEach(function() {
      class CurrentUserStub extends Service {
        certificationPointOfContact = { save: sinon.stub().resolves() };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      controller = this.owner.lookup('controller:terms-of-service');
      controller.transitionToRoute = sinon.stub().resolves();
    });

    test('it should save acceptance of terms of service', async function(assert) {
      // given
      const saveStub = this.owner.lookup('service:current-user').certificationPointOfContact.save;

      // when
      await controller.send('submit');

      // then
      sinon.assert.calledWith(saveStub, { adapterOptions: { acceptPixCertifTermsOfService: true } });
      assert.ok(controller);
    });

    test('it should transition to authenticated.sessions.list', async function(assert) {
      // when
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'authenticated.sessions.list');
      assert.ok(controller);
    });
  });
});
