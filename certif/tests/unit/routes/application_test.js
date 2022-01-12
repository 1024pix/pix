import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  load = sinon.stub();
}
class FeatureTogglesStub extends Service {
  load = sinon.stub().resolves();
}

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  test('it should load the current user', async function (assert) {
    // given
    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.register('service:feature-toggles', FeatureTogglesStub);

    const route = this.owner.lookup('route:application');

    // when
    await route.beforeModel();

    // then
    assert.ok(route.currentUser.load.called);
  });
});
