import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/list');
  });

  module('#model', function(hooks) {
    const expectedSessions = Symbol('sessions');

    hooks.beforeEach(function() {
      route.currentUser = { certificationCenter: { sessions: expectedSessions } };
    });

    test('it should return certification center sessions', function(assert) {
      // when
      const actualSessions = route.model();

      // then
      assert.equal(actualSessions, expectedSessions);
    });
  });
});
