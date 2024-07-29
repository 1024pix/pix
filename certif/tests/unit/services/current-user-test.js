import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';
import sinon from 'sinon';

module('Unit | Service | current-user', function (hooks) {
  setupTest(hooks);

  module('user is authenticated', function () {
    test('should load the current certification point of contact', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccesseA = store.createRecord('allowed-certification-center-access', {
        id: '789',
      });

      const allowedCertificationCenterAccesseB = store.createRecord('allowed-certification-center-access', {
        id: '456',
      });

      const certificationCenterMembershipA = store.createRecord('certification-center-membership', {
        id: '1231',
        certificationCenterId: 789,
        userId: 123,
        role: 'ADMIN',
      });

      const certificationCenterMembershipB = store.createRecord('certification-center-membership', {
        id: '1232',
        certificationCenterId: 456,
        userId: 123,
        role: 'MEMBER',
      });

      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: '124',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccesseA, allowedCertificationCenterAccesseB],
        certificationCenterMemberships: [certificationCenterMembershipA, certificationCenterMembershipB],
      });

      sinon.stub(store, 'queryRecord').resolves(certificationPointOfContact);

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.certificationPointOfContact, certificationPointOfContact);
      assert.strictEqual(currentUser.currentAllowedCertificationCenterAccess, allowedCertificationCenterAccesseA);
      assert.deepEqual(currentUser.currentCertificationCenterMembership, certificationCenterMembershipA);
      assert.true(currentUser.isAdminOfCurrentCertificationCenter);
    });
  });

  module('user is not authenticated', function () {
    test('should do nothing', async function (assert) {
      // given
      class SessionStub extends Service {
        isAuthenticated = false;
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.certificationPointOfContact, undefined);
    });
  });

  module('user token is expired', function () {
    test('should redirect to login', async function (assert) {
      // Given

      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'findRecord').rejects({ errors: [{ code: 401 }] });

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
        invalidate = () => resolve('invalidate');
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // When
      const result = await currentUser.load();

      // Then

      assert.strictEqual(result, 'invalidate');
    });
  });

  module('#checkRestrictedAccess', function () {
    test('should redirect to restricted access route when current certification center has restricted access', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: true,
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
      });
      const replaceWithStub = sinon.stub();
      class RouterStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', RouterStub);
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.certificationPointOfContact = certificationPointOfContact;
      currentUser.currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;

      // when
      currentUser.checkRestrictedAccess();

      // then
      sinon.assert.calledWithExactly(replaceWithStub, 'authenticated.restricted-access');
      assert.true(true);
    });

    test('should not redirect to restricted access route when current certification center has no restricted access', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
      });
      const replaceWithStub = sinon.stub();
      class RouterStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', RouterStub);
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.certificationPointOfContact = certificationPointOfContact;
      currentUser.currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;

      // when
      currentUser.checkRestrictedAccess();

      // then
      sinon.assert.notCalled(replaceWithStub);
      assert.true(true);
    });
  });

  module('#updateCurrentCertificationCenter', function () {
    test('should modify the current allowed certification center access', function (assert) {
      // given
      const userId = 123;
      const store = this.owner.lookup('service:store');

      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '111',
      });

      const newAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '222',
      });

      const currentCertificationCenterMembership = store.createRecord('certification-center-membership', {
        id: '1231',
        certificationCenterId: 111,
        userId,
        role: 'MEMBER',
      });

      const newCertificationCenterMembership = store.createRecord('certification-center-membership', {
        id: '1232',
        certificationCenterId: 222,
        userId,
        role: 'ADMIN',
      });

      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: '124',
        allowedCertificationCenterAccesses: [
          currentAllowedCertificationCenterAccess,
          newAllowedCertificationCenterAccess,
        ],
        certificationCenterMemberships: [currentCertificationCenterMembership, newCertificationCenterMembership],
      });

      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.certificationPointOfContact = certificationPointOfContact;
      currentUser.currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;

      // when
      currentUser.updateCurrentCertificationCenter(222);

      // then

      assert.strictEqual(currentUser.currentAllowedCertificationCenterAccess, newAllowedCertificationCenterAccess);
      assert.strictEqual(currentUser.currentCertificationCenterMembership, newCertificationCenterMembership);
      assert.true(currentUser.isAdminOfCurrentCertificationCenter);
    });
  });
});
