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
    const expectedModel = Symbol('model');

    hooks.beforeEach(function() {
      route.modelFor = sinon.stub().returns(expectedModel);
    });

    test('it should return the expectedModel', function(assert) {
      // when
      const actualModel = route.model();

      // then
      sinon.assert.calledWith(route.modelFor, 'authenticated.sessions.details');
      assert.equal(actualModel, expectedModel);
    });
  });
});
