import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated', function (hooks) {
  setupTest(hooks);

  test('should check if user is authenticated', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated');
    const sessionService = this.owner.lookup('service:session');
    sessionService.requireAuthenticationAndApprovedTermsOfService = sinon.stub();
    const transition = Symbol('');

    // when
    route.beforeModel(transition);

    // then
    sinon.assert.calledWith(sessionService.requireAuthenticationAndApprovedTermsOfService, transition);
    assert.ok(true);
  });
});
