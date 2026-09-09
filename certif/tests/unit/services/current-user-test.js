import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | current-user', function (hooks) {
  setupTest(hooks);

  module('user is authenticated', function () {
    test('loads the current certification point of contact', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccesseA = store.createRecord('allowed-certification-center-access', {
        id: 789,
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
      sinon.stub(certificationCenterMembershipA, 'save').resolves();

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
      sinon.assert.calledWith(certificationCenterMembershipA.save, {
        adapterOptions: { updateLastAccessedAt: true },
      });
      assert.ok(true);
    });
  });

  module('user is not authenticated', function () {
    test('does nothing', async function (assert) {
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
    test('redirects to login', async function (assert) {
      // Given

      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'findRecord').rejects({ errors: [{ code: 401 }] });

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
        invalidate = async () => 'invalidate';
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
    test('redirects to restricted access route when current certification center has restricted access', async function (assert) {
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

    test('does not redirect to restricted access route when current certification center has no restricted access', async function (assert) {
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
    test('modifies the current allowed certification center access', async function (assert) {
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
      sinon.stub(newCertificationCenterMembership, 'save').resolves();

      // when
      await currentUser.updateCurrentCertificationCenter(222);

      // then

      assert.strictEqual(currentUser.currentAllowedCertificationCenterAccess, newAllowedCertificationCenterAccess);
      assert.strictEqual(currentUser.currentCertificationCenterMembership, newCertificationCenterMembership);
      assert.true(currentUser.isAdminOfCurrentCertificationCenter);
      sinon.assert.calledWith(newCertificationCenterMembership.save, {
        adapterOptions: { updateLastAccessedAt: true },
      });
      assert.ok(true);
    });

    test('saves the new center id in localStorage', async function (assert) {
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
      sinon.stub(newCertificationCenterMembership, 'save').resolves();
      localStorage.clear();

      // when
      await currentUser.updateCurrentCertificationCenter(222);

      // then
      assert.strictEqual(localStorage.getItem('currentCenterId'), '222');
    });
  });

  module('localStorage persistence', function (hooks) {
    hooks.beforeEach(function () {
      localStorage.clear();
    });

    hooks.afterEach(function () {
      localStorage.clear();
    });

    test('loads center from localStorage when no query param is present', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccessA = store.createRecord('allowed-certification-center-access', {
        id: '111',
      });

      const allowedCertificationCenterAccessB = store.createRecord('allowed-certification-center-access', {
        id: '222',
      });

      const certificationCenterMembershipA = store.createRecord('certification-center-membership', {
        id: '1231',
        certificationCenterId: 111,
        userId: 123,
        role: 'MEMBER',
      });

      const certificationCenterMembershipB = store.createRecord('certification-center-membership', {
        id: '1232',
        certificationCenterId: 222,
        userId: 123,
        role: 'ADMIN',
      });

      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: '124',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccessA, allowedCertificationCenterAccessB],
        certificationCenterMemberships: [certificationCenterMembershipA, certificationCenterMembershipB],
      });

      sinon.stub(store, 'queryRecord').resolves(certificationPointOfContact);
      sinon.stub(certificationCenterMembershipB, 'save').resolves();

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      localStorage.setItem('currentCenterId', '222');

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.currentAllowedCertificationCenterAccess.id, '222');
      assert.strictEqual(currentUser.currentCertificationCenterMembership, certificationCenterMembershipB);
      assert.true(currentUser.isAdminOfCurrentCertificationCenter);
    });

    test('prioritizes query param centerId over localStorage', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccessA = store.createRecord('allowed-certification-center-access', {
        id: '111',
      });

      const allowedCertificationCenterAccessB = store.createRecord('allowed-certification-center-access', {
        id: '222',
      });

      const certificationCenterMembershipA = store.createRecord('certification-center-membership', {
        id: '1231',
        certificationCenterId: 111,
        userId: 123,
        role: 'MEMBER',
      });

      const certificationCenterMembershipB = store.createRecord('certification-center-membership', {
        id: '1232',
        certificationCenterId: 222,
        userId: 123,
        role: 'ADMIN',
      });

      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: '124',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccessA, allowedCertificationCenterAccessB],
        certificationCenterMemberships: [certificationCenterMembershipA, certificationCenterMembershipB],
      });

      sinon.stub(store, 'queryRecord').resolves(certificationPointOfContact);
      sinon.stub(certificationCenterMembershipA, 'save').resolves();

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.register('service:session', SessionStub);

      localStorage.setItem('currentCenterId', '222');

      const originalURLSearchParams = window.URLSearchParams;
      window.URLSearchParams = class extends originalURLSearchParams {
        constructor() {
          super('?centerId=111');
        }
      };

      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.currentAllowedCertificationCenterAccess.id, '111');
      assert.strictEqual(currentUser.currentCertificationCenterMembership, certificationCenterMembershipA);
      assert.false(currentUser.isAdminOfCurrentCertificationCenter);

      window.URLSearchParams = originalURLSearchParams;
    });

    test('saves selected center to localStorage on load', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccessA = store.createRecord('allowed-certification-center-access', {
        id: '789',
      });

      const certificationCenterMembershipA = store.createRecord('certification-center-membership', {
        id: '1231',
        certificationCenterId: 789,
        userId: 123,
        role: 'ADMIN',
      });

      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: '124',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccessA],
        certificationCenterMemberships: [certificationCenterMembershipA],
      });

      sinon.stub(store, 'queryRecord').resolves(certificationPointOfContact);
      sinon.stub(certificationCenterMembershipA, 'save').resolves();

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.strictEqual(localStorage.getItem('currentCenterId'), '789');
    });
  });
});
