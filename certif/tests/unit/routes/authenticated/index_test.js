import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions', function (hooks) {
  setupTest(hooks);

  test('it should redirects to authenticated.sessions.list', async function (assert) {
    // given
    class RouterStub extends Service {
      replaceWith = sinon.stub().resolves();
    }
    class CurrentUserStub extends Service {
      checkRestrictedAccess = () => {};
    }
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:current-user', CurrentUserStub);
    const route = this.owner.lookup('route:authenticated/index');

    // when
    await route.beforeModel();

    // then
    assert.ok(route.router.replaceWith.calledWith('authenticated.sessions.list'));
  });
});
