import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function(hooks) {

    let connectedUser;
    let currentUser;

    hooks.beforeEach(function() {
      const connectedUserId = 1;
      connectedUser = Object.create({ id: connectedUserId });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);
    });

    test('should load the current user', async function(assert) {
      // Given
      connectedUser.memberships = [{ organization: [] }];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.user, connectedUser);
    });

    test('should load the organization', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      connectedUser.memberships = [{ organization }];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.organization, organization);
    });

    test('should load the memberships', async function(assert) {
      // Given
      const memberships = [ Object.create({ id: 1, organization: {} }), Object.create({ id: 2, organization: {} }) ];
      connectedUser.memberships = memberships;

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.memberships, memberships);
    });

    test('should set isAdminInOrganization to true', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ userId: connectedUser.id, organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.isAdminInOrganization, true);
    });

    test('should set isAdminInOrganization to false', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ userId: connectedUser.id, organization, organizationRole: 'MEMBER', isAdmin: false });
      connectedUser.memberships = [membership];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.isAdminInOrganization, false);
    });

    test('should set canAccessStudentsPage to true', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
      const membership = Object.create({ userId: connectedUser.id, organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.canAccessStudentsPage, true);
    });

    test('should set canAccessStudentsPage to false when type is PRO', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isSco: false });
      const membership = Object.create({ userId: connectedUser.id, organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships =  [membership];

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.canAccessStudentsPage, false);
    });

    test('should set canAccessStudentsPage to false when isManagingStudents is false', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
      const membership = Object.create({ userId: connectedUser.id, organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];

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

  module('#updateMainOrganization', function(hooks) {

    let currentUser;

    hooks.beforeEach(async function() {
      const connectedUserId = 1;
      const firstOrganization = Object.create({ id: 1, name: 'First Organization', isSco: false, isManagingStudents: false });
      const secondOrganization = Object.create({ id: 2, name: 'Second Organization', isSco: true, isManagingStudents: true });
      const firstMembership = Object.create({ organization: firstOrganization, isAdmin: true });
      const secondMembership = Object.create({ organization: secondOrganization, isAdmin: false });
      const connectedUser = Object.create({ id: connectedUserId, memberships: [firstMembership, secondMembership] });
      const storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      await currentUser.load();
    });

    test('should update organization values when new main organization is found', async function(assert) {
      // Given
      const organizationId = 2;

      // When
      await currentUser.updateMainOrganization(organizationId);

      // Then
      assert.equal(currentUser.organization.id, organizationId);
      assert.equal(currentUser.isAdminInOrganization, false);
      assert.equal(currentUser.canAccessStudentsPage, true);
    });

    test('should do nothing when new main organization is not found', async function(assert) {
      // Given
      const organizationId = 3;

      // When
      await currentUser.updateMainOrganization(organizationId);

      // Then
      assert.equal(currentUser.organization.id, 1);
      assert.equal(currentUser.isAdminInOrganization, true);
      assert.equal(currentUser.canAccessStudentsPage, false);
    });
  });
});

