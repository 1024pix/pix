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
    test('it should return session with time', async function (assert) {
      // given
      const session_id = 1;
      route.store.findRecord = sinon.stub().resolves({});

      // when
      const actualSession = await route.model({ session_id });

      // then
      sinon.assert.calledOnceWithExactly(route.store.findRecord, 'session-enrolment', session_id);
      assert.ok(actualSession.time);
    });
  });

  module('#deactivate', function (hooks) {
    hooks.beforeEach(function () {
      route.controller = { model: { rollbackAttributes: sinon.stub().returns() } };
    });

    test('it should call rollback on controller model', function (assert) {
      // when
      route.deactivate();

      // then
      sinon.assert.calledOnce(route.controller.model.rollbackAttributes);
      assert.ok(route);
    });
  });
});
