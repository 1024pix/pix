import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-centers/get/invitations', function (hooks) {
  setupTest(hooks);

  test("it should unload certification center invitations because it's maybe other certification center's invitations", async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certification-centers/get/invitations');
    const store = this.owner.lookup('service:store');

    store.findAll = sinon.stub();
    store.unloadAll = sinon.stub();
    route.modelFor = sinon.stub().returns({ certificationCenter: { id: 777 } });

    // when
    await route.model();

    // then
    assert.ok(store.unloadAll.calledWith('certification-center-invitation'));
  });

  test('it should return certification center with its invitations', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certification-centers/get/invitations');
    const store = this.owner.lookup('service:store');

    const certificationCenterInvitations = Symbol('some certification center invitations');

    store.unloadAll = sinon.stub();
    route.modelFor = sinon.stub();
    route.modelFor.withArgs('authenticated.certification-centers.get').returns({ certificationCenter: { id: 777 } });
    store.findAll = sinon.stub();
    store.findAll
      .withArgs('certification-center-invitation', {
        adapterOptions: { certificationCenterId: 777 },
      })
      .resolves(certificationCenterInvitations);

    // when
    const result = await route.model();

    // then
    assert.deepEqual(result, { certificationCenterId: 777, certificationCenterInvitations });
  });
});
