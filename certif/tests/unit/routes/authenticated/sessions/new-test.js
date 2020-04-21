import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/new', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/new');
  });

  module('#model', function(hooks) {
    const createdSession = Symbol('newSession');
    const certificationCenter = Symbol('certificationCenter');

    hooks.beforeEach(function() {
      route.store.createRecord = sinon.stub().resolves(createdSession);
      route.currentUser = { certificationCenter };
    });

    test('it should return the recently created session', async function(assert) {
      // when
      const actualSession = await route.model();

      // then
      sinon.assert.calledWith(route.store.createRecord, 'session', { certificationCenter });
      assert.equal(actualSession, createdSession);
    });
  });

  module('#deactivate', function(hooks) {

    hooks.beforeEach(function() {
      route.controller = { model: { deleteRecord: sinon.stub().returns() } };
    });

    module('when model has dirty attributes', function() {

      test('it should call rollback on controller model', function(assert) {
        // given
        route.controller.model.hasDirtyAttributes = true;

        // when
        route.deactivate();

        // then
        sinon.assert.calledOnce(route.controller.model.deleteRecord);
        assert.ok(route);
      });
    });

    module('when model has clean attributes', function() {

      test('it should not call rollback on controller model', function(assert) {
        // given
        route.controller.model.hasDirtyAttributes = false;

        // when
        route.deactivate();

        // then
        sinon.assert.notCalled(route.controller.model.deleteRecord);
        assert.ok(route);
      });
    });
  });
});
