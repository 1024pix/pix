import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/get/children', function (hooks) {
  setupTest(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/organizations/get/children');
    store = this.owner.lookup('service:store');
  });

  module('#handleFormSubmitted', function () {
    test('attaches child organization to parent organization', async function (assert) {
      // given
      const childOrganizationId = '1234';
      const organizationAdapter = { attachChildOrganization: sinon.stub().resolves() };

      sinon.stub(store, 'adapterFor').returns(organizationAdapter);
      controller.model = {
        organization: store.createRecord('organization', { id: '12' }),
        organizations: { reload: sinon.stub().resolves() },
      };

      // when
      await controller.handleFormSubmitted(childOrganizationId);

      // then
      assert.true(store.adapterFor.calledWithExactly('organization'));
      assert.true(
        organizationAdapter.attachChildOrganization.calledWithExactly({
          childOrganizationId: '1234',
          parentOrganizationId: '12',
        }),
      );
      assert.true(controller.model.organizations.reload.calledOnce);
    });
  });
});
