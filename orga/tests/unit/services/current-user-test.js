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
      currentUserService.store = storeStub;
      currentUserService.session = sessionStub;
    });

    test('should load the current user', async function(assert) {
      // when
      await currentUserService.load();

      // then
      assert.equal(currentUserService.user, connectedUser);
    });

    test('should load the memberships', async function(assert) {
      // given
      const firstOrganization = Object.create({ id: 9 });
      const secondOrganization = Object.create({ id: 10 });
      const memberships = [Object.create({ organization: firstOrganization }), Object.create({ organization: secondOrganization })];
      connectedUser.memberships = memberships;

      // when
      await currentUserService.load();

      // then
      assert.equal(currentUserService.memberships, memberships);
    });

    test('should load the organization', async function(assert) {
      // given
      const organization = Object.create({ id: 9 });
      connectedUser.memberships = [Object.create({ organization })];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // when
      await currentUserService.load();

      // then
      assert.equal(currentUserService.organization, organization);
    });

    module('When member is not ADMIN', function() {

      test('should set isAdminInOrganization to false', async function(assert) {
        // given
        const organization = Object.create({ id: 9 });
        const membership = Object.create({ organization, organizationRole: 'MEMBER', isAdmin: false });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isAdminInOrganization, false);
      });
    });

    module('When member is ADMIN', function() {

      test('should set isAdminInOrganization to true', async function(assert) {
        // given
        const organization = Object.create({ id: 9 });
        const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isAdminInOrganization, true);
      });

      test('should set isSCOManagingStudents to true when type is SCO', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
        const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, true);
      });

      test('should set isSCOManagingStudents to false when type is PRO', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isSco: false });
        const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, false);
      });

      test('should set isSCOManagingStudents to false when isManagingStudents is false', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, false);
      });

      test('should prefer organization from userOrgaSettings rather than first membership', async function(assert) {
        // given
        const organization1 = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const organization2 = Object.create({ id: 10, type: 'SCO', isManagingStudents: false, isSco: true });
        const membership1 = Object.create({ organization: organization1, organizationRole: 'ADMIN', isAdmin: true });
        const membership2 = Object.create({ organization: organization2, organizationRole: 'ADMIN', isAdmin: true });
        const userOrgaSettings = Object.create({ organization: organization2 });
        connectedUser.memberships = [membership1, membership2];
        connectedUser.userOrgaSettings = userOrgaSettings;

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.organization.id, organization2.id);
      });

      module('when user has no userOrgaSettings', function(hooks) {

        let firstOrganization;

        hooks.beforeEach(function() {
          firstOrganization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
          const secondOrganization = Object.create({ id: 10, type: 'SCO', isManagingStudents: false, isSco: true });
          const membership1 = Object.create({ organization: firstOrganization, organizationRole: 'ADMIN', isAdmin: true });
          const membership2 = Object.create({ organization: secondOrganization, organizationRole: 'ADMIN', isAdmin: true });
          connectedUser.memberships = [membership1, membership2];

          storeStub.createRecord = sinon.stub().returns({
            save: sinon.stub()
          });
        });

        test('should create it', async function(assert) {
          // given
          const createRecordSpy = sinon.spy();
          storeStub.createRecord = createRecordSpy;

          // when
          await currentUserService.load();

          // then
          assert.equal(createRecordSpy.callCount, 1);
          assert.ok(createRecordSpy.calledWith('user-orga-setting', {
            user: connectedUser,
            organization: firstOrganization
          }));
        });

        test('should set the first membership\'s organization as current organization', async function(assert) {
          // when
          await currentUserService.load();

          // then
          assert.equal(currentUserService.organization, firstOrganization);
        });

        test('should set isAdminInOrganization', async function(assert) {
          // when
          await currentUserService.load();

          // then
          assert.equal(currentUserService.isAdminInOrganization, true);
        });

        test('should set isSCOManagingStudents', async function(assert) {
          // when
          await currentUserService.load();

          // then
          assert.equal(currentUserService.isSCOManagingStudents, false);
        });
      });
    });

    module('when organization in userOrgaSettings doesn\'t match with memberships', function(hooks) {

      let saveStub;
      let firstOrganization;

      hooks.beforeEach(function() {
        firstOrganization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const secondOrganization = Object.create({ id: 10, type: 'SCO', isManagingStudents: false, isSco: true });
        const notMatchingOrganization = Object.create({ id: 11, type: 'SCO', isManagingStudents: false, isSco: true });

        const membership1 = Object.create({ organization: firstOrganization, organizationRole: 'ADMIN', isAdmin: true });
        const membership2 = Object.create({ organization: secondOrganization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership1, membership2];

        saveStub = sinon.stub();

        connectedUser.userOrgaSettings = Object.create({ organization: notMatchingOrganization, save: saveStub });
      });

      test('should update the organization of the userOrgaSettings', async function(assert) {
        // when
        await currentUserService.load();

        // then
        assert.equal(saveStub.callCount, 1);
      });

      test('should set the membership\'s organization as current organization', async function(assert) {
        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.organization, firstOrganization);
        assert.equal(currentUserService.organization, firstOrganization);
      });
    });
  });

  module('user is not authenticated', function() {

    test('should do nothing', async function(assert) {
      // given
      const sessionStub = Service.create({
        isAuthenticated: false,
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.session = sessionStub;

      // when
      await currentUser.load();

      // then
      assert.equal(currentUser.user, null);
    });
  });

  module('user token is expired', function() {

    test('should redirect to login', async function(assert) {
      // given
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
      currentUser.store = storeStub;
      currentUser.session = sessionStub;

      // when
      const result = await currentUser.load();

      // then
      assert.equal(result, 'invalidate');
    });
  });
});

