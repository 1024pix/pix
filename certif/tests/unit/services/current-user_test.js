import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import { run } from '@ember/runloop';
import Service from '@ember/service';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function() {

    test('should load the current certification point of contact', async function(assert) {
      // given
      const originalStore = this.owner.lookup('service:store');
      const certificationPointOfContact = run(() => originalStore.createRecord('certification-point-of-contact', {
        id: 123,
        allowedCertificationCenterAccesses: [],
      }));
      class StoreStub extends Service {
        findRecord = () => resolve(certificationPointOfContact);
      }
      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
      }
      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // when
      await currentUser.load();

      // then
      assert.equal(currentUser.certificationPointOfContact, certificationPointOfContact);
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

      class StoreStub extends Service {
        findRecord = () => reject({ errors: [{ code: 401 }] });
      }
      class SessionStub extends Service {
        isAuthenticated = true;
        data = { authenticated: { user_id: 123 } };
        invalidate = () => resolve('invalidate');
      }
      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
      this.owner.register('service:session', SessionStub);
      const currentUser = this.owner.lookup('service:currentUser');

      // When
      const result = await currentUser.load();

      // Then
      assert.equal(result, 'invalidate');
    });
  });
});

