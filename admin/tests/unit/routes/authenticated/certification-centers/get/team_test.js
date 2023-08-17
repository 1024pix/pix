import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-centers/get/team', function (hooks) {
  setupTest(hooks);

  test('it should return certification center memberships', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certification-centers/get/team');
    const store = this.owner.lookup('service:store');

    const certificationCenterMemberships = Symbol('some certification center memberships');
    store.query = sinon.stub();
    store.query
      .withArgs('certification-center-membership', {
        filter: {
          certificationCenterId: 777,
        },
      })
      .resolves(certificationCenterMemberships);

    route.modelFor = sinon.stub();
    route.modelFor.withArgs('authenticated.certification-centers.get').returns({ certificationCenter: { id: 777 } });

    // when
    const result = await route.model();

    // then
    assert.strictEqual(result.certificationCenterMemberships, certificationCenterMemberships);
    assert.strictEqual(result.certificationCenterId, 777);
  });
});
