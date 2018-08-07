import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject } from 'rsvp';
import Service from '@ember/service';

function createLoadServiceStub() {
  return Service.create({
    called: false,
    load: function() {
      this.called = true;
      return reject();
    }
  });
}

module('Unit | Route | application', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:application');
    assert.ok(route);
  });

  test('it should load the current user', function(assert) {
    // given
    let route =  this.owner.lookup('route:application');
    const currentUserStub = createLoadServiceStub();
    route.set('currentUser', currentUserStub);

    // when
    route.sessionAuthenticated();

    // then
    assert.ok(true, currentUserStub.called);
  });

  test('it should load the current organization', function(assert) {
    // given
    let route =  this.owner.lookup('route:application');
    const currentUserStub = createLoadServiceStub();
    const currentOrganizationStub = createLoadServiceStub();

    route.set('currentUser', currentUserStub);
    route.set('currentOrganization', currentOrganizationStub);

    // when
    route.sessionAuthenticated();

    // then
    assert.ok(true, currentOrganizationStub.called);
  });

});
