import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module(
  'Unit | Route | authenticated/sup-organization-participants/sup-organization-participant/activity',
  function (hooks) {
    setupTest(hooks);

    let route;
    let store;

    hooks.beforeEach(function () {
      route = this.owner.lookup(
        'route:authenticated/sup-organization-participants/sup-organization-participant/activity'
      );
      store = this.owner.lookup('service:store');
      route.modelFor = sinon.stub().returns({ id: '123' });
      sinon.stub(route.router, 'replaceWith');
      sinon.stub(store, 'queryRecord');
    });

    test("should return model if user is authorized to display student's activity", async function (assert) {
      // given
      const expectedModel = {};
      store.queryRecord.resolves(expectedModel);

      // when
      const model = await route.model();

      // then
      assert.strictEqual(model, expectedModel);
      assert.ok(route.router.replaceWith.notCalled);
    });

    test("should redirect to students page if user is not authorized to display student's activity", async function (assert) {
      // given
      store.queryRecord.rejects({ errors: [{ status: '403' }] });

      // when
      const model = await route.model();

      // then
      assert.strictEqual(model, undefined);
      assert.ok(route.router.replaceWith.calledWith('authenticated.sup-organization-participants'));
    });
  }
);
