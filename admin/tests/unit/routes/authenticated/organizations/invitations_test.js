import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organizations/get/invitations', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/organizations/get/invitations');
    assert.ok(route);
  });

  module('#beforeModel', function () {
    test('it should transition to target-profiles route when organization is archived', async function (assert) {
      // given
      const organization = EmberObject.create({ isArchived: true });
      const route = this.owner.lookup('route:authenticated/organizations/get/invitations');
      sinon.stub(route.router, 'replaceWith');
      sinon.stub(route, 'modelFor').returns(organization);

      // when
      await route.beforeModel();

      // then
      assert.ok(route.router.replaceWith.calledWith('authenticated.organizations.get.target-profiles'));
    });
  });
});
