import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function() {

    test('should load the current user', async function(assert) {
      // Given
      const connectedUserId = 1;
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [{ organization: [] }]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.user, connectedUser);
    });

    test('should load the organization', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9 });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [{ organization }]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.organization, organization);
    });

    test('should set isOwnerInOrganization to true', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ userId: connectedUserId, organization, organizationRole: 'OWNER', isOwner: true });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [membership]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.isOwnerInOrganization, true);
    });

    test('should set isOwnerInOrganization to false', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ userId: connectedUserId, organization, organizationRole: 'MEMBER', isOwner: false });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [membership]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.isOwnerInOrganization, false);
    });

    test('should set canAccessStudentsPage to true', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
      const membership = Object.create({ userId: connectedUserId, organization, organizationRole: 'OWNER', isOwner: true });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [membership]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.canAccessStudentsPage, true);
    });

    test('should set canAccessStudentsPage to false when type is PRO', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isSco: false });
      const membership = Object.create({ userId: connectedUserId, organization, organizationRole: 'OWNER', isOwner: true });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [membership]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.canAccessStudentsPage, false);
    });

    test('should set canAccessStudentsPage to false when isManagingStudents is false', async function(assert) {
      // Given
      const connectedUserId = 1;
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
      const membership = Object.create({ userId: connectedUserId, organization, organizationRole: 'OWNER', isOwner: true });
      const connectedUser = Object.create({
        id: connectedUserId,
        memberships: [membership]
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.canAccessStudentsPage, false);
    });
  });

  module('user is not authenticated', function() {

    test('should do nothing', async function(assert) {
      // Given
      const sessionStub = Service.create({
        isAuthenticated: false,
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.user, null);
    });
  });

  module('user token is expired', function() {

    test('should redirect to login', async function(assert) {
      // Given
      const connectedUserId = 1;
      const storeStub = Service.create({
        queryRecord: () => reject({ errors: [{ code: 401 }] })
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } },
        invalidate: () => resolve('invalidate'),
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      const result = await currentUser.load();

      // Then
      assert.equal(result, 'invalidate');
    });
  });
});

