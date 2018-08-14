import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { A as EmberArray } from '@ember/array';
import Object from '@ember/object';
import { resolve } from 'rsvp';

module('Unit | Service | current-organization', function(hooks) {

  setupTest(hooks);

  test('it should stock the current organization data if user exists', function(assert) {
    // given
    const userOrganization = Object.create({ name: 'Orga Nisme'});
    const organizationAccess = Object.create({ organization: userOrganization });
    const organizationAccesses = EmberArray([organizationAccess]);

    const connectedUser = Object.create({ id: 1 });
    connectedUser.get = () => resolve(organizationAccesses);

    let service = this.owner.lookup('service:current-organization');

    // when
    service.load(connectedUser);

    // then
    service.get('organization').then((organization) => {
      assert.equal(organization, userOrganization);
    });
  });

  test('it should not be writable', function(assert) {
    // given
    let service = this.owner.lookup('service:current-organization');

    // when
    const failingAction = () => service.set('organization', 'should not pass');

    // then
    assert.throws(failingAction);
  });

  test('it should do nothing when user is not authenticated', function(assert) {
    // given
    let service = this.owner.lookup('service:current-organization');

    // when
    const promise = service.load(undefined);
    // then
    return promise.then(() => {
      assert.ok(true, 'Promise has been resolved');
    });
  });
});

