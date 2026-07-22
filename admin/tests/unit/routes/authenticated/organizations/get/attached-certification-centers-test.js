import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organizations/get/attached-certification-centers', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/organizations/get/attached-certification-centers');
  });

  test('it exists', function (assert) {
    assert.ok(route);
  });

  module('#model', function () {
    test('it calls store.query with the organizationId and returns the certification centers with the organizationId', async function (assert) {
      // given
      const organization = { id: '42' };
      const attachedCertificationCenters = [{ id: '1', name: 'Centre Pix' }];
      route.modelFor = sinon.stub().returns(organization);
      route.store = { query: sinon.stub().resolves(attachedCertificationCenters) };

      // when
      const result = await route.model();

      // then
      sinon.assert.calledWith(route.store.query, 'attached-certification-center', {
        organizationId: organization.id,
      });
      assert.deepEqual(result, { attachedCertificationCenters, organizationId: '42' });
    });
  });
});
