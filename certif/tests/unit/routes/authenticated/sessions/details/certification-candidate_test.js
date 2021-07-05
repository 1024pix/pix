import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/details/certification-candidates', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/details/certification-candidates');
  });

  module('#model', function(hooks) {
    const details = { session: Symbol('session') };
    const countries = Symbol('countries');
    const expectedModel = {
      ...details,
      countries,
    };

    hooks.beforeEach(function() {
      route.modelFor = sinon.stub().returns(details);
      route.store.findAll = sinon.stub().returns(countries);
    });

    test('it should return the expectedModel', async function(assert) {
      // when
      const actualModel = await route.model();

      // then
      sinon.assert.calledWith(route.modelFor, 'authenticated.sessions.details');
      sinon.assert.calledWith(route.store.findAll, 'country');
      assert.deepEqual(actualModel, expectedModel);
    });
  });
});
