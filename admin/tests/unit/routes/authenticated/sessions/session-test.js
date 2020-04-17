import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/session', function(hooks) {
  setupTest(hooks);

  test('#setupController', function(assert) {
    // given
    const sessions = { inputId: 5 };
    const id = Symbol('id');
    const route = this.owner.lookup('route:authenticated/sessions/session');
    route.controllerFor = sinon.stub().returns(sessions);

    // when
    route.setupController(null, { id });

    // then
    assert.equal(sessions.inputId, id);
    assert.ok(route.controllerFor.calledWith('authenticated.sessions.session'));
  });

  test('#error', function(assert) {
    // given
    const route = this.owner.lookup('route:authenticated/sessions/session');
    const notificationsStub = {
      anError: 'an Error',
      error: sinon.stub().resolves(),
    };
    route.notifications = notificationsStub;
    route.transitionTo = () => {};

    // when
    route.send('error');

    // then
    sinon.assert.called(notificationsStub.error);
    assert.ok(route);
  });
});
