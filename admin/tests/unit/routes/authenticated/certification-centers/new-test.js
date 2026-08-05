import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-centers/new', function (hooks) {
  setupTest(hooks);

  let route, store, habilitations;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/certification-centers/new');
    store = this.owner.lookup('service:store');

    habilitations = Symbol('some habilitations');
    store.findAll = sinon.stub();
    store.findAll.withArgs('complementary-certification').resolves(habilitations);
    store.findRecord = sinon.stub();
  });

  test('it should return habilitations and no attached organization', async function (assert) {
    // given
    const transition = { to: { queryParams: {} } };

    // when
    const result = await route.model(undefined, transition);

    // then
    assert.strictEqual(result.habilitations, habilitations);
    assert.strictEqual(result.attachedOrganization, null);
    assert.ok(store.findRecord.notCalled);
  });

  test('it should return the attached organization when there is an attachedOrganizationId query param', async function (assert) {
    // given
    const attachedOrganization = Symbol('the attached organization');
    store.findRecord.withArgs('organization', '123').resolves(attachedOrganization);
    const transition = { to: { queryParams: { attachedOrganizationId: '123' } } };

    // when
    const result = await route.model(undefined, transition);

    // then
    assert.strictEqual(result.habilitations, habilitations);
    assert.strictEqual(result.attachedOrganization, attachedOrganization);
  });
});
