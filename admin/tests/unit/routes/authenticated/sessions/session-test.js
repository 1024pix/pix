import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/session', function(hooks) {
  setupTest(hooks);

  test('#error', function(assert) {
    // given
    const route = this.owner.lookup('route:authenticated/sessions/session');
    const notificationsStub = {
      anError: 'an Error',
      error: sinon.stub().resolves(),
    };
    route.notifications = notificationsStub;

    // when
    route.send('error');

    // then
    sinon.assert.called(notificationsStub.error);
    assert.ok(route);
  });
});
