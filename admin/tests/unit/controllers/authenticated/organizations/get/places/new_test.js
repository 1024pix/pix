import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/places/new', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.organizations.get.places.new');
  });

  module('#create', function () {
    module('when places lot is saved', function () {
      test('it displays success notification', async function (assert) {
        // given
        const notifications = {
          success: sinon.stub(),
        };
        const router = {
          transitionTo: sinon.stub(),
        };
        const model = {
          organizationId: 11,
          setProperties: sinon.stub(),
          save: sinon.stub(),
        };
        const attrtibutes = {
          count: 12,
        };

        controller.set('model', model);
        controller.set('notifications', notifications);
        controller.set('router', router);

        await controller.create(attrtibutes);

        sinon.assert.calledWith(model.setProperties, attrtibutes);
        sinon.assert.calledWith(model.save, { adapterOptions: { organizationId: model.organizationId } });
        sinon.assert.calledWith(notifications.success, 'Le lot de place est enregistré.');
        assert.ok(true);
      });
    });

    module('when places lot is saved not', function () {
      test('it displays error notification', async function (assert) {
        // given
        const notifications = {
          error: sinon.stub(),
        };
        const router = {
          transitionTo: sinon.stub(),
        };
        const model = {
          organizationId: 11,
          setProperties: sinon.stub(),
          save: sinon.stub().rejects(),
          errors: Symbol('error'),
        };
        const attrtibutes = {
          count: 12,
        };

        controller.set('model', model);
        controller.set('notifications', notifications);
        controller.set('router', router);

        await controller.create(attrtibutes);

        sinon.assert.calledWith(notifications.error, 'Erreur lors de la création du lot de place.');
        assert.strictEqual(controller.errors, model.errors);
      });
    });
  });
});
