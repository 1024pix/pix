import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certification-centers/new', function (hooks) {
  setupTest(hooks);
  let transitionToStub;
  hooks.beforeEach(function () {
    const router = this.owner.lookup('service:router');
    transitionToStub = sinon.stub(router, 'transitionTo');
  });

  module('redirectOnCancel', function () {
    test('it should redirect to organization page related to attachedOrganizationId param', async function (assert) {
      const attachedOrganizationId = 123;
      const controller = this.owner.lookup('controller:authenticated/certification-centers/new');
      controller.set('attachedOrganizationId', attachedOrganizationId);

      controller.redirectOnCancel();

      assert.ok(
        transitionToStub.calledWith(
          'authenticated.organizations.get.attached-certification-centers',
          attachedOrganizationId,
        ),
      );
    });
    test('it should redirect to certification center list when no attachedOrganizationId param is provided', async function (assert) {
      const controller = this.owner.lookup('controller:authenticated/certification-centers/new');

      controller.redirectOnCancel();

      assert.ok(transitionToStub.calledWith('authenticated.certification-centers'));
    });
  });
});
