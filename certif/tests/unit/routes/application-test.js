import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import Service from '@ember/service';

function createLoadServiceStub() {
  return Service.create({
    called: false,
    load: function() {
      this.called = true;
      return resolve();
    }
  });
}

module('Unit | Route | application', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:application');
    assert.ok(route);
  });

  test('it should load the current user', function(assert) {
    // given
    const route = this.owner.lookup('route:application');
    const currentUserStub = createLoadServiceStub();
    route.set('currentUser', currentUserStub);

    // when
    const promise = route.sessionAuthenticated();

    // then
    return promise.catch(() => {
      assert.ok(currentUserStub.called);
    });
  });
});
