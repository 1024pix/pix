import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { A as EmberArray } from '@ember/array';
import Object from '@ember/object';
import { resolve } from 'rsvp';

module('Unit | Service | current-certification-center', function(hooks) {

  setupTest(hooks);

  test('it should stock the current certification center data if user exists', function(assert) {
    // given
    const userCertificationCenter = Object.create({ name: 'Certification Center' });
    const certificationCenterMembership = Object.create({ certificationCenter: userCertificationCenter });
    const certificationCenterMemberships = EmberArray([certificationCenterMembership]);

    const connectedUser = Object.create({ id: 1 });
    connectedUser.get = () => resolve(certificationCenterMemberships);

    const service = this.owner.lookup('service:current-certification-center');

    // when
    service.load(connectedUser);

    // then
    service.get('certificationCenter').then((certificationCenter) => {
      assert.equal(certificationCenter, userCertificationCenter);
    });
  });

  test('it should not be writable', function(assert) {
    // given
    const service = this.owner.lookup('service:current-certification-center');

    // when
    const failingAction = () => service.set('certificationCenter', 'should not pass');

    // then
    assert.throws(failingAction);
  });

  test('it should do nothing when user is not authenticated', function(assert) {
    // given
    const service = this.owner.lookup('service:current-certification-center');

    // when
    const promise = service.load(undefined);
    // then
    return promise.then(() => {
      assert.ok(true, 'Promise has been resolved');
    });
  });
});

