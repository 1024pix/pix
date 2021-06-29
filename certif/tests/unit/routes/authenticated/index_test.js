import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

class RouterStub extends Service {
  replaceWith = sinon.stub().resolves();
}

module('Unit | Route | authenticated/sessions', function(hooks) {

  setupTest(hooks);

  test('it should redirects to authenticated.sessions.list', async function(assert) {
    // given
    this.owner.register('service:router', RouterStub);
    const route = this.owner.lookup('route:authenticated/index');

    // when
    await route.beforeModel();

    // then
    assert.ok(route.router.replaceWith.calledWith('authenticated.sessions.list'));
  });
});
