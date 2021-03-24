import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/new', (hooks) => {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/new');
  });

  module('#model', (hooks) => {
    const createdSession = Symbol('newSession');
    const certificationCenterId = 123;

    hooks.beforeEach(() => {
      route.store.createRecord = sinon.stub().resolves(createdSession);
      route.currentUser = { certificationPointOfContact: { currentCertificationCenterId: certificationCenterId } };
    });

    test('it should return the recently created session', async function(assert) {
      // when
      const actualSession = await route.model();

      // then
      sinon.assert.calledWith(route.store.createRecord, 'session', { certificationCenterId });
      assert.equal(actualSession, createdSession);
    });
  });

  module('#deactivate', (hooks) => {

    hooks.beforeEach(() => {
      route.controller = { model: { deleteRecord: sinon.stub().returns() } };
    });

    module('when model has dirty attributes', () => {

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

    module('when model has clean attributes', () => {

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
