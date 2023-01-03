import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organization-participants/organization-participant', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/organization-participants/organization-participant');
    store = this.owner.lookup('service:store');
    sinon.stub(route.router, 'replaceWith');
    sinon.stub(store, 'findRecord');
  });

  test('should return participant using the parameter given', async function (assert) {
    // given
    store.findRecord.resolves();

    // when
    await route.model({ participant_id: 77 });

    // then
    sinon.assert.calledWith(store.findRecord, 'organization-learner', 77);
    assert.ok(true);
  });

  test('should return participant model when the store find it', async function (assert) {
    // given
    const expectedModel = Symbol('Participant');
    store.findRecord.resolves(expectedModel);

    // when
    const model = await route.model({ participant_id: 77 });

    // then
    assert.strictEqual(model, expectedModel);
    assert.ok(route.router.replaceWith.notCalled);
  });

  test('should redirect to participants page if participant is not found', async function (assert) {
    // given
    store.findRecord.rejects({ errors: [{ status: '403' }] });

    // when
    const model = await route.model({ participant_id: 3324 });

    // then
    assert.strictEqual(model, undefined);
    assert.ok(route.router.replaceWith.calledWith('authenticated.organization-participants'));
  });
});
