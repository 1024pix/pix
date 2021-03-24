import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | current-user', (hooks) => {

  setupTest(hooks);

  module('user is authenticated', (hooks) => {

    let currentUserService;
    let connectedUser;
    let storeStub;
    let sessionStub;

    hooks.beforeEach(function() {
      const connectedUserId = 1;
      connectedUser = Object.create({
        id: connectedUserId,
        memberships: [{ organization: [] }],
      });
      storeStub = Service.create({
        queryRecord: () => resolve(connectedUser),
      });
      sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } },
        invalidate: () => undefined,
      });
      currentUserService = this.owner.lookup('service:currentUser');
      currentUserService.store = storeStub;
      currentUserService.session = sessionStub;
    });

    test('should load the current user', async function(assert) {
      // when
      await currentUserService.load();

      // then
      assert.equal(currentUserService.prescriber, connectedUser);
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

    module('When member is not ADMIN', () => {

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

    module('When member is ADMIN', () => {

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
    });

    module('When member is part of SCO organization which is managing students', () => {
      test('should set isSCOManagingStudents to true', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, true);
      });

      test('should set isSUPManagingStudents to false', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSup: false, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSUPManagingStudents, false);
      });
    });

    module('When member is part of SUP organization which is managing students', () => {
      test('should set isSCOManagingStudents to false', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: true, isSco: false, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, false);
      });

      test('should set isSUPManagingStudents to true', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: true, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSUPManagingStudents, true);
      });
    });

    module('When member is part of PRO organization which is managing students', () => {
      test('should set isSCOManagingStudents to false with PRO organization', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isPro: true, isSco: false });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, false);
      });

      test('should set isSUPManagingStudents to false with PRO organization', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isPro: true, isSup: false });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSUPManagingStudents, false);
      });
    });

    module('When organization does not manage students', () => {
      test('should set isSCOManagingStudents to false when organization is SCO', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSCOManagingStudents, false);
      });

      test('should set isSUPManagingStudents to false when organization is SUP', async function(assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: false, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.isSUPManagingStudents, false);
      });
    });

    module('when user has userOrgaSettings', () => {
      test('should prefer organization from userOrgaSettings rather than first membership', async function(assert) {
        // given
        const organization1 = Object.create({ id: 9 });
        const organization2 = Object.create({ id: 10 });
        const membership1 = Object.create({ organization: organization1 });
        const membership2 = Object.create({ organization: organization2 });
        const userOrgaSettings = Object.create({ organization: organization2 });
        connectedUser.memberships = [membership1, membership2];
        connectedUser.userOrgaSettings = userOrgaSettings;

        // when
        await currentUserService.load();

        // then
        assert.equal(currentUserService.organization.id, organization2.id);
      });
    });
  });

  module('user is not authenticated', () => {

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
      assert.equal(currentUser.prescriber, null);
    });
  });

  module('user is not a prescriber anymore', () => {

    test('should redirect to login because not a prescriber', async function(assert) {
      // given
      const connectedUserId = 1;
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } },
        invalidate: () => resolve('invalidate'),
      });
      const storeStub = Service.create({
        queryRecord: () => reject([{ code: 403 }]),
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.session = sessionStub;
      currentUser.store = storeStub;

      // when
      await currentUser.load();

      // then
      assert.equal(currentUser.prescriber, null);
    });
  });

  module('user token is expired', () => {

    test('should redirect to login', async function(assert) {
      // given
      const connectedUserId = 1;
      const storeStub = Service.create({
        queryRecord: () => reject({ errors: [{ code: 401 }] }),
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

