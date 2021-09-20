import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function() {

    test('should load the current certification point of contact', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const allowedCertificationCenterAccesseA = store.createRecord('allowed-certification-center-access', {
        id: 789,
      });
      const allowedCertificationCenterAccesseB = store.createRecord('allowed-certification-center-access', {
        id: 456,
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        id: 124,
        allowedCertificationCenterAccesses: [
          allowedCertificationCenterAccesseA, allowedCertificationCenterAccesseB,
        ],
      });
      sinon.stub(store, 'findRecord').resolves(certificationPointOfContact);

      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.equal(currentUser.certificationPointOfContact, certificationPointOfContact);
      assert.equal(currentUser.currentAllowedCertificationCenterAccess, allowedCertificationCenterAccesseA);
    });
  });

  module('user is not authenticated', function() {

    test('should do nothing', async function(assert) {
      // given
      class SessionStub extends Service {
        isAuthenticated = false;
      }
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.equal(currentUser.certificationPointOfContact, null);
    });
  });

  module('user token is expired', function() {

    test('should redirect to login', async function(assert) {
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
      assert.equal(result, 'invalidate');
    });
  });

  module('#checkRestrictedAccess', function() {

    test('should redirect to restricted access route when current certification center has restricted access', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: true,
      });
      const replaceWithStub = sinon.stub();
      class RouterStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', RouterStub);
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;

      // when
      currentUser.checkRestrictedAccess();

      // then
      sinon.assert.calledWithExactly(replaceWithStub, 'authenticated.restricted-access');
      assert.true(true);
    });

    test('should not redirect to restricted access route when current certification center has no restricted access', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
      });
      const replaceWithStub = sinon.stub();
      class RouterStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', RouterStub);
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;

      // when
      currentUser.checkRestrictedAccess();

      // then
      sinon.assert.notCalled(replaceWithStub);
      assert.true(true);
    });
  });
});

