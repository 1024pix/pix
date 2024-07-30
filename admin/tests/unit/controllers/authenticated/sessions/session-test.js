import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session', function (hooks) {
  setupTest(hooks);

  test('#loadSession', function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated.sessions.session');
    const routerStub = {
      currentRouteName: 'authenticated.sessions.session',
      transitionTo: sinon.stub().resolves(),
    };
    const eventStub = { preventDefault: sinon.stub().resolves() };
    controller.router = routerStub;
    controller.inputId = '5';

    // when
    controller.send('loadSession', eventStub);

    // then
    sinon.assert.called(routerStub.transitionTo);
    sinon.assert.calledWith(routerStub.transitionTo, routerStub.currentRouteName, '5');
    assert.ok(controller);
  });
});
