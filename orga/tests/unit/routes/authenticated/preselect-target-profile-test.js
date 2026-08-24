import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/preselect-target-profile', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('fetch a frameworks', async function (assert) {
      // given
      const organization = { id: Symbol('organizationId') };
      const frameworks = Symbol('frameworks');
      const route = this.owner.lookup('route:authenticated/preselect-target-profile');
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:current-user');

      sinon.stub(currentUser, 'organization').value(organization);

      sinon
        .stub(store, 'findAll')
        .withArgs('framework', { adapterOptions: { organizationId: organization.id } })
        .resolves(frameworks);

      // when
      const result = await route.model();

      // then
      assert.deepEqual(result, { frameworks, organization });
    });
  });
});
