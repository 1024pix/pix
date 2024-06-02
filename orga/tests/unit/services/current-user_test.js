import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { reject, resolve } from 'rsvp';

module('Unit | Service | current-user', function (hooks) {
  setupTest(hooks);

  module('user is authenticated', function (hooks) {
    let currentUserService;
    let connectedUser;
    let storeStub;
    let sessionStub;

    hooks.beforeEach(function () {
      const connectedUserId = 1;
      connectedUser = Object.create({
        id: connectedUserId,
        memberships: [{ organization: [] }],
      });
      storeStub = Service.create({
        findRecord: () => resolve(connectedUser),
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

    test('should load the current user', async function (assert) {
      // given
      const organization = Object.create({ id: 9 });
      const memberships = [Object.create({ organization })];

      connectedUser.userOrgaSettings = Object.create({ user: connectedUser, organization });
      connectedUser.memberships = memberships;
      connectedUser.userOrgaSettings = Object.create({ organization });

      // when
      await currentUserService.load();

      // then
      assert.strictEqual(currentUserService.prescriber, connectedUser);
    });

    test('should load the memberships', async function (assert) {
      // given
      const firstOrganization = Object.create({ id: 9 });
      const secondOrganization = Object.create({ id: 10 });
      const memberships = [
        Object.create({ organization: firstOrganization }),
        Object.create({ organization: secondOrganization }),
      ];

      connectedUser.userOrgaSettings = Object.create({ user: connectedUser, organization: firstOrganization });
      connectedUser.memberships = memberships;

      // when
      await currentUserService.load();

      // then
      assert.strictEqual(currentUserService.memberships, memberships);
    });

    test('should load the organization', async function (assert) {
      // given
      const organization = Object.create({ id: 9 });
      connectedUser.memberships = [Object.create({ organization })];
      connectedUser.userOrgaSettings = Object.create({ organization });

      // when
      await currentUserService.load();

      // then
      assert.strictEqual(currentUserService.organization, organization);
    });

    module('When member is not ADMIN', function () {
      test('should set isAdminInOrganization to false', async function (assert) {
        // given
        const organization = Object.create({ id: 9 });
        const membership = Object.create({ organization, organizationRole: 'MEMBER', isAdmin: false });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isAdminInOrganization);
      });
    });

    module('When member is ADMIN', function () {
      test('should set isAdminInOrganization to true', async function (assert) {
        // given
        const organization = Object.create({ id: 9 });
        const membership = Object.create({ organization, organizationRole: 'ADMIN', isAdmin: true });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.true(currentUserService.isAdminInOrganization);
      });
    });

    module('When member is part of SCO organization which is managing students', function () {
      test('should set isSCOManagingStudents to true', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.true(currentUserService.isSCOManagingStudents);
      });

      test('should set isSUPManagingStudents to false', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: true, isSup: false, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSUPManagingStudents);
      });
    });

    module('When member is part of SUP organization which is managing students', function () {
      test('should set isSCOManagingStudents to false', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: true, isSco: false, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSCOManagingStudents);
      });

      test('should set isSUPManagingStudents to true', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: true, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.true(currentUserService.isSUPManagingStudents);
      });
    });

    module('When member is part of PRO organization which is managing students', function () {
      test('should set isSCOManagingStudents to false with PRO organization', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isPro: true, isSco: false });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSCOManagingStudents);
      });

      test('should set isSUPManagingStudents to false with PRO organization', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'PRO', isManagingStudents: true, isPro: true, isSup: false });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSUPManagingStudents);
      });
    });

    module('When organization does not manage students', function () {
      test('should set isSCOManagingStudents to false when organization is SCO', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SCO', isManagingStudents: false, isSco: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSCOManagingStudents);
      });

      test('should set isSUPManagingStudents to false when organization is SUP', async function (assert) {
        // given
        const organization = Object.create({ id: 9, type: 'SUP', isManagingStudents: false, isSup: true });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.false(currentUserService.isSUPManagingStudents);
      });
    });

    module('when user has userOrgaSettings', function () {
      test('should prefer organization from userOrgaSettings rather than first membership', async function (assert) {
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
        assert.strictEqual(currentUserService.organization.id, organization2.id);
      });
    });

    module('when organization has "GAR" as identity provider for campaigns', function () {
      test('sets isGARAuthenticationMethod to true', async function (assert) {
        // given
        const organization = Object.create({
          id: 9,
          type: 'SUP',
          isManagingStudents: false,
          isSup: true,
          identityProviderForCampaigns: 'GAR',
        });
        const membership = Object.create({ organization });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.true(currentUserService.isGARAuthenticationMethod);
      });
    });

    module('#canAccessPlacesPage', function () {
      test('should return true if user is admin and organization has feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          placesManagement: true,
        };

        assert.true(currentUserService.canAccessPlacesPage);
      });

      test('should return false if user is admin and organization does not have feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          placesManagement: false,
        };

        assert.false(currentUserService.canAccessPlacesPage);
      });

      test('should return false if user is not admin', function (assert) {
        currentUserService.isAdminInOrganization = false;
        currentUserService.prescriber = {
          placesManagement: true,
        };

        assert.false(currentUserService.canAccessPlacesPage);
      });
    });

    module('#canAccessMissionsPage', function () {
      test('should return true if user has feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: true,
        };

        assert.true(currentUserService.canAccessMissionsPage);
      });

      test('should return false if user does not have feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: false,
        };

        assert.false(currentUserService.canAccessMissionsPage);
      });
    });

    module('#canAccessCampaignsPage', function () {
      test('should return false if user has mission feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: true,
        };

        assert.false(currentUserService.canAccessCampaignsPage);
      });

      test('should return true if user does not have missions feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: false,
        };

        assert.true(currentUserService.canAccessCampaignsPage);
      });
    });

    module('#canAccessParticipantsPage', function () {
      test('should return false if user has mission feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: true,
        };

        assert.false(currentUserService.canAccessParticipantsPage);
      });

      test('should return true if user does not have missions feature activated', function (assert) {
        currentUserService.prescriber = {
          missionsManagement: false,
        };

        assert.true(currentUserService.canAccessParticipantsPage);
      });
    });

    module('#canAccessImportPage', function (hooks) {
      hooks.beforeEach(function () {
        currentUserService.prescriber = { hasOrganizationLearnerImport: false };
      });

      module('when is admin of the organization', function () {
        test('should return false if organization is not sco managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.isSCOManagingStudents = false;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return true if organization is sco managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.isSCOManagingStudents = true;

          assert.true(currentUserService.canAccessImportPage);
        });

        test('should return false if organization not sup managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.isSUPManagingStudents = false;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return true if organization is sup managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.isSUPManagingStudents = true;

          assert.true(currentUserService.canAccessImportPage);
        });

        test('should return true if user can use import learner feature', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.prescriber = { hasOrganizationLearnerImport: true };

          assert.true(currentUserService.canAccessImportPage);
        });
      });

      module('when is not admin of the organization', function () {
        test('should return false if organization is not sco managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.isSCOManagingStudents = false;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if organization is sco managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.isSCOManagingStudents = true;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if organization not sup managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.isSUPManagingStudents = false;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if organization is sup managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.isSUPManagingStudents = true;

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if user can use import learner feature', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.prescriber = { hasOrganizationLearnerImport: true };

          assert.false(currentUserService.canAccessImportPage);
        });
      });
    });

    module('#hasLearnerImportFeature', function () {
      test('should return true if user has learnerImport feature activated', function (assert) {
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: true,
        };

        assert.true(currentUserService.hasLearnerImportFeature);
      });

      test('should return false if user does not have learnerImport feature activated', function (assert) {
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };

        assert.false(currentUserService.hasLearnerImportFeature);
      });
    });
  });

  module('user is not authenticated', function () {
    test('should do nothing', async function (assert) {
      // given
      const sessionStub = Service.create({
        isAuthenticated: false,
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.session = sessionStub;

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.prescriber, undefined);
    });
  });

  module('user is not a prescriber anymore', function () {
    test('should redirect to login because not a prescriber', async function (assert) {
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
      assert.strictEqual(currentUser.prescriber, null);
    });
  });

  module('user token is expired', function () {
    test('should redirect to login', async function (assert) {
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
      assert.strictEqual(result, 'invalidate');
    });
  });
});
