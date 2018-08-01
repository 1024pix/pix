import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import Service from '@ember/service';
import Object from '@ember/object';
import { reject, resolve } from 'rsvp';
import { run } from '@ember/runloop';

function buildResolvingStore(resolvedModel) {
  return Service.create({
    findRecord: function() {
      return resolve(resolvedModel);
    }
  });
}

function buildRejectingStore() {
  return Service.create({
    findRecord: function() {
      return reject();
    }
  });
}

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  test('it should stock the user data if user is authenticated', function(assert) {
    // given
    const connectedUserId = 1;
    const connectedUser = Object.create({ id: connectedUserId });

    const sessionStub = Service.create({
      data: { authenticated: { user_id: connectedUserId } }
    });

    const storeStub = buildResolvingStore(connectedUser);

    let service = this.owner.lookup('service:current-user');
    service.set('store', storeStub);
    service.set('session', sessionStub);

    // when
    run(() => {
      service.load();
    });

    // then
    service.get('user').then((user) => {
      assert.equal(user, connectedUser);
    });
  });

  test('it should not be writable', function(assert) {
    // given
    let service = this.owner.lookup('service:current-user');

    // when
    const failingAction = () => service.set('user', 'should not pass');

    // then
    assert.throws(failingAction);
  });

  test('it should reject if user is not found', function(assert) {
    // given
    const storeStub = buildRejectingStore();
    const sessionStub = Service.create({
      data: { authenticated: { user_id: 123 } }
    });


    let service = this.owner.lookup('service:current-user');
    service.set('session', sessionStub);
    service.set('store', storeStub);

    run(() => {
      // when
      const promise = service.load();
      // then
      assert.rejects(promise);
    });
  });

  test('it should do nothing when user is not authenticated', function(assert) {
    // given
    const connectedUserId = undefined;

    const sessionStub = Service.create({
      data: { authenticated: { user_id: connectedUserId } }
    });

    let service = this.owner.lookup('service:current-user');
    service.set('session', sessionStub);

    return run(() => {
      // when
      const promise = service.load();
      // then
      return promise.then(() => {
        assert.ok(true, 'Promise has been resolved');
      });
    });
  });
});

