import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/update', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sessions/update');
  });

  module('#model', function () {
    test('it should return session with time without seconds', async function (assert) {
      // given
      const session_id = 1;
      route.store.findRecord = sinon.stub().resolves({ time: '14:30:00' });

      // when
      const actualSession = await route.model({ session_id });

      // then
      sinon.assert.calledOnceWithExactly(route.store.findRecord, 'session-enrolment', session_id);
      assert.strictEqual(actualSession.time, '14:30');
    });
  });

  module('#resetController', function () {
    test('it should rollback the model when exiting the route', function (assert) {
      // given
      const controller = { model: { rollbackAttributes: sinon.stub() } };

      // when
      route.resetController(controller, true);

      // then
      sinon.assert.calledOnce(controller.model.rollbackAttributes);
      assert.ok(route);
    });

    test('it should not rollback the model when not exiting the route', function (assert) {
      // given
      const controller = { model: { rollbackAttributes: sinon.stub() } };

      // when
      route.resetController(controller, false);

      // then
      sinon.assert.notCalled(controller.model.rollbackAttributes);
      assert.ok(route);
    });
  });
});
