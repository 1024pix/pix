import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/session', (hooks) => {
  setupTest(hooks);

  test('#setupController', function(assert) {
    // given
    const sessions = { inputId: 5 };
    const id = Symbol('id');
    const route = this.owner.lookup('route:authenticated/sessions/session');

    // when
    route.setupController(sessions, { id });

    // then
    assert.equal(sessions.inputId, id);
  });

  test('#error', function(assert) {
    // given
    const route = this.owner.lookup('route:authenticated/sessions/session');
    const errorNotifierStub = {
      notify: sinon.stub().resolves(),
    };
    route.errorNotifier = errorNotifierStub;
    route.transitionTo = () => {};

    // when
    route.send('error');

    // then
    sinon.assert.called(errorNotifierStub.notify);
    assert.ok(route);
  });
});
