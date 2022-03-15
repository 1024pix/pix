import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/get', function (hooks) {
  setupTest(hooks);

  module('#archiveOrganization', function () {
    test('it should update organization and redirect to get route', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.organizations.get');
      controller.router = { transitionTo: sinon.stub() };
      controller.model = {
        id: 3,
        save: sinon.stub(),
      };
      controller.notifications = {
        success: sinon.stub(),
      };
      controller.model.save.resolves();

      // when
      await controller.archiveOrganization();

      // then
      assert.ok(controller.model.save.called);
      assert.true(controller.router.transitionTo.calledWith('authenticated.organizations.get'));
    });
  });
});
