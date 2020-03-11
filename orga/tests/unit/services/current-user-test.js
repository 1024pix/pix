import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function(hooks) {

    let currentUserService;
    let connectedUser;
    let storeStub;

    hooks.beforeEach(function() {
      const connectedUserId = 1;
      connectedUser = Object.create({
        id: connectedUserId,
        memberships: [{ organization: [] }],
      });
      storeStub = Service.create({
        queryRecord: () => resolve(connectedUser)
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } }
      });
      currentUserService = this.owner.lookup('service:currentUser');
      currentUserService.set('store', storeStub);
      currentUserService.set('session', sessionStub);
    });

    test('should load the current user', async function(assert) {
      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.user, connectedUser);
    });

    test('should load the memberships', async function(assert) {
      // Given
      const firstOrganization = Object.create({ id: 9 });
      const secondOrganization = Object.create({ id: 10 });
      const memberships = [Object.create({ organization: firstOrganization }), Object.create({ organization: secondOrganization })];
      connectedUser.memberships = memberships;

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.memberships, memberships);
    });

    test('should load the organization', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      connectedUser.memberships = [Object.create({ organization })];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.organization, organization);
    });

    test('should set isAdminInOrganization to true', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.isAdminInOrganization, true);
    });

    test('should set isAdminInOrganization to false', async function(assert) {
      // Given
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ organization, organizationRole: 'MEMBER', isAdmin: false });
      connectedUser.memberships = [membership];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.isAdminInOrganization, false);
    });

    test('should set canAccessStudentsPage to true', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
      const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.canAccessStudentsPage, true);
    });

    test('should set canAccessStudentsPage to false when type is PRO', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isSco: false });
      const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.canAccessStudentsPage, false);
    });

    test('should set canAccessStudentsPage to false when isManagingStudents is false', async function(assert) {
      // Given
      const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
      const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
      connectedUser.memberships = [membership];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.canAccessStudentsPage, false);
    });

    test('should prefer organization from userOrgaSettings rather than first membership', async function(assert) {
      // Given
      const organization1 = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
      const organization2 = Object.create({ id: 10, type: 'SCO', isManagingStudents: false, isSco: true });
      const membership1 = Object.create({ organization: organization1, organizationRole: 'ADMIN', isAdmin: true });
      const membership2 = Object.create({ organization: organization2, organizationRole: 'ADMIN', isAdmin: true });
      const userOrgaSettings = Object.create({ organization: organization2 });
      connectedUser.memberships = [membership1, membership2];
      connectedUser.userOrgaSettings = userOrgaSettings;

      // When
      await currentUserService.load();

      // Then
      assert.equal(currentUserService.organization.id, organization2.id);
    });

    module('when user has no userOrgaSettings', function(hooks) {

      let firstOrganization;

      hooks.beforeEach(function() {
        firstOrganization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const organization2 = Object.create({ id: 10, type: 'SCO', isManagingStudents: false, isSco: true });
        const membership1 = Object.create({ organization: firstOrganization, organizationRole: 'ADMIN', isAdmin: true });
        const membership2 = Object.create({ organization: organization2, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership1, membership2];

        storeStub.createRecord = sinon.stub().returns({
          save: sinon.stub()
        });
      });

      test('should create it', async function(assert) {
        // Given
        const createRecordSpy = sinon.spy();
        storeStub.createRecord = createRecordSpy;

        // When
        await currentUserService.load();

        // Then
        assert.equal(createRecordSpy.callCount, 1);
        assert.ok(createRecordSpy.calledWith('user-orga-setting', {
          user: connectedUser,
          organization: firstOrganization
        }));
      });

      test('should set the first membership\'s organization as current organization', async function(assert) {
        // When
        await currentUserService.load();

        // Then
        assert.equal(currentUserService.organization, firstOrganization);
      });

      test('should set isAdminInOrganization', async function(assert) {
        // When
        await currentUserService.load();

        // Then
        assert.equal(currentUserService.isAdminInOrganization, true);
      });

      test('should set canAccessStudentsPage', async function(assert) {
        // When
        await currentUserService.load();

        // Then
        assert.equal(currentUserService.canAccessStudentsPage, false);
      });
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

