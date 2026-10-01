import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

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
        findRecord: sinon.stub().resolves(connectedUser),
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
      const memberships = [Object.create({ organization, save: sinon.stub().resolves() })];

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
        Object.create({ organization: firstOrganization, save: sinon.stub().resolves() }),
        Object.create({ organization: secondOrganization, save: sinon.stub().resolves() }),
      ];

      connectedUser.userOrgaSettings = Object.create({ user: connectedUser, organization: firstOrganization });
      connectedUser.memberships = memberships;

      // when
      await currentUserService.load();

      // then
      assert.strictEqual(currentUserService.memberships, memberships);
    });

    test('saves the membership with updateLastAccessedAt option', async function (assert) {
      // given
      const organization = Object.create({ id: 9 });
      const membership = Object.create({ organization, save: sinon.stub().resolves() });
      connectedUser.userOrgaSettings = Object.create({ user: connectedUser, organization });
      connectedUser.memberships = [membership];

      // when
      await currentUserService.load();

      // then
      sinon.assert.calledWith(membership.save, {
        adapterOptions: { updateLastAccessedAt: true },
      });
      assert.ok(true);
    });

    test('should load the organization', async function (assert) {
      // given
      const organization = Object.create({ id: 9 });
      connectedUser.memberships = [Object.create({ organization, save: sinon.stub().resolves() })];
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
        const membership = Object.create({
          organization,
          organizationRole: 'MEMBER',
          isAdmin: false,
          save: sinon.stub().resolves(),
        });
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
        const membership = Object.create({
          organization,
          organizationRole: 'ADMIN',
          isAdmin: true,
          save: sinon.stub().resolves(),
        });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
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
        const membership1 = Object.create({ organization: organization1, save: sinon.stub().resolves() });
        const membership2 = Object.create({ organization: organization2, save: sinon.stub().resolves() });
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
      test('sets isGarAuthenticationMethod to true', async function (assert) {
        // given
        const organization = Object.create({
          id: 9,
          type: 'SUP',
          isManagingStudents: false,
          isSup: true,
          identityProviderForCampaigns: 'GAR',
        });
        const membership = Object.create({ organization, save: sinon.stub().resolves() });
        connectedUser.memberships = [membership];
        connectedUser.userOrgaSettings = Object.create({ organization });

        // when
        await currentUserService.load();

        // then
        assert.true(currentUserService.isGarAuthenticationMethod);
      });
    });

    module('#hasImportFeature', function () {
      test('should return true if organization has feature import activated', function (assert) {
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: true,
        };
        currentUserService.organization = { isManagingStudents: false };

        assert.true(currentUserService.hasImportFeature);
      });

      test('should return true if organization is managing student', function (assert) {
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };
        currentUserService.organization = { isManagingStudents: true };

        assert.true(currentUserService.hasImportFeature);
      });

      test('should return false if organization is not managing student without learner import feature', function (assert) {
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };
        currentUserService.organization = { isManagingStudents: false };

        assert.false(currentUserService.hasImportFeature);
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

    module('#canAccessAttestationsPage', function () {
      test('should return true if user is admin and organization has feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          attestationsManagement: true,
        };

        assert.true(currentUserService.canAccessAttestationsPage);
      });

      test('should return false if user is admin and organization does not have feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          attestationsManagement: false,
        };

        assert.false(currentUserService.canAccessAttestationsPage);
      });

      test('should return false if user is not admin and organization has feature activated', function (assert) {
        currentUserService.isAdminInOrganization = false;
        currentUserService.prescriber = {
          attestationsManagement: true,
        };

        assert.false(currentUserService.canAccessAttestationsPage);
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

    module('#canAccessImportPage', function (hooks) {
      hooks.beforeEach(function () {
        currentUserService.prescriber = { hasOrganizationLearnerImport: false };
      });

      module('when is admin of the organization', function () {
        test('should return false if organization is not managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.organization = { isManagingStudents: false };

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return true if organization is managing student', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.organization = { isManagingStudents: true };

          assert.true(currentUserService.canAccessImportPage);
        });

        test('should return true if user can use import learner feature', function (assert) {
          currentUserService.isAdminInOrganization = true;
          currentUserService.organization = { isManagingStudents: false };

          currentUserService.prescriber = { hasOrganizationLearnerImport: true };

          assert.true(currentUserService.canAccessImportPage);
        });
      });

      module('when is not admin of the organization', function () {
        test('should return false if organization is not managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.organization = { isManagingStudents: false };

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if organization is managing student', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.organization = { isManagingStudents: true };

          assert.false(currentUserService.canAccessImportPage);
        });

        test('should return false if user can use import learner feature', function (assert) {
          currentUserService.isAdminInOrganization = false;
          currentUserService.organization = { isManagingStudents: false };
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

    module('#canAccessStatisticsPage', function () {
      test('should return true if user is admin and organization has feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          hasCoverRateFeature: true,
        };

        assert.true(currentUserService.canAccessStatisticsPage);
      });

      test('should return false if user is admin and organization does not have feature activated', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          hasCoverRateFeature: false,
        };

        assert.false(currentUserService.canAccessStatisticsPage);
      });
      test('should return false if user is not admin', function (assert) {
        currentUserService.isAdminInOrganization = false;
        currentUserService.prescriber = {
          hasCoverRateFeature: true,
        };

        assert.false(currentUserService.canAccessStatisticsPage);
      });
    });

    module('#canEditLearnerName', function () {
      test('should return true if user is admin, organisation has no import feature and organization is not managing students', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };
        currentUserService.organization = {
          isManagingStudents: false,
        };

        assert.true(currentUserService.canEditLearnerName);
      });

      test('should return false if user is not admin', function (assert) {
        currentUserService.isAdminInOrganization = false;
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };
        currentUserService.organization = {
          isManagingStudents: false,
        };

        assert.false(currentUserService.canEditLearnerName);
      });

      test('should return false if user has import feature', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: true,
        };
        currentUserService.organization = {
          isManagingStudents: false,
        };

        assert.false(currentUserService.canEditLearnerName);
      });

      test('should return false if organization is managing students', function (assert) {
        currentUserService.isAdminInOrganization = true;
        currentUserService.prescriber = {
          hasOrganizationLearnerImport: false,
        };
        currentUserService.organization = {
          isManagingStudents: true,
        };

        assert.false(currentUserService.canEditLearnerName);
      });
    });

    module('#loadCombinedCourseBlueprints', function () {
      test('should load combined course blueprints from organization', async function (assert) {
        // given
        const combinedCourseBlueprint1 = Object.create({ id: 1 });
        const combinedCourseBlueprint2 = Object.create({ id: 2 });
        const combinedCourseBlueprints = [combinedCourseBlueprint1, combinedCourseBlueprint2];

        currentUserService.organization = Object.create({ combinedCourseBlueprints });

        // when
        await currentUserService.loadCombinedCourseBlueprints();

        // then
        assert.deepEqual(currentUserService.combinedCourseBlueprints, combinedCourseBlueprints);
      });
    });

    module('#loadDivisions', function () {
      test('should return null on organization not managingStudents', async function (assert) {
        // given
        currentUserService.organization = {
          isManagingStudents: false,
        };

        // when
        const result = await currentUserService.loadDivisions();

        // then
        assert.strictEqual(result, null);
      });

      test('should return null on organization managingStudents', async function (assert) {
        // given
        currentUserService.organization = {
          isManagingStudents: false,
          isSco: false,
          isSup: false,
        };

        // when
        const result = await currentUserService.loadDivisions();

        // then
        assert.strictEqual(result, null);
      });

      test('should return divisions on sco organization managingStudents', async function (assert) {
        // given
        const division1 = Object.create({ id: 1 });
        const group1 = Object.create({ id: 2 });
        currentUserService.organization = {
          isManagingStudents: true,
          isSco: true,
          divisions: [division1],
          groups: [group1],
        };

        // when
        const result = await currentUserService.loadDivisions();

        // then
        assert.deepEqual(result, [division1]);
      });

      test('should return divisions on sup organization managingStudents', async function (assert) {
        // given
        const division1 = Object.create({ id: 1 });
        const group1 = Object.create({ id: 2 });
        currentUserService.organization = {
          isManagingStudents: true,
          isSup: true,
          divisions: [division1],
          groups: [group1],
        };

        // when
        const result = await currentUserService.loadDivisions();

        // then
        assert.deepEqual(result, [group1]);
      });
    });

    module('#hasCombinedCourseBlueprints', function () {
      test('should return true when combined course blueprints exist', function (assert) {
        // given
        currentUserService.combinedCourseBlueprints = [Object.create({ id: 1 })];

        // then
        assert.true(currentUserService.hasCombinedCourseBlueprints);
      });

      test('should return false when combined course blueprints is empty array', function (assert) {
        // given
        currentUserService.combinedCourseBlueprints = [];

        // then
        assert.false(currentUserService.hasCombinedCourseBlueprints);
      });

      test('should return false when combined course blueprints is null', function (assert) {
        // given
        currentUserService.combinedCourseBlueprints = null;

        // then
        assert.false(currentUserService.hasCombinedCourseBlueprints);
      });

      test('should return false when combined course blueprints is undefined', function (assert) {
        // given
        currentUserService.combinedCourseBlueprints = undefined;

        // then
        assert.false(currentUserService.hasCombinedCourseBlueprints);
      });
    });
  });

  module('user is not authenticated', function () {
    test('should do nothing', async function (assert) {
      // given
      const sessionStub = Service.create({ isAuthenticated: false });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.session = sessionStub;

      // when
      await currentUser.load();

      // then
      assert.strictEqual(currentUser.prescriber, undefined);
    });
  });

  module('user is not a prescriber', function () {
    test('throws an error', async function (assert) {
      // given
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: 1 } },
        invalidate: sinon.stub().resolves('invalidate'),
        routeAfterInvalidation: null,
      });
      const storeStub = Service.create({
        findRecord: () => Promise.reject({ errors: [{ code: 'USER_HAS_NO_ORGANIZATION_MEMBERSHIP' }] }),
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.session = sessionStub;
      currentUser.store = storeStub;

      // when / then
      assert.rejects(
        currentUser.load(),
        (err) => err.code === 'USER_HAS_NO_ORGANIZATION_MEMBERSHIP',
        'expected currentUser.load to throw an error with code USER_HAS_NO_ORGANIZATION_MEMBERSHIP',
      );
    });
  });
});
