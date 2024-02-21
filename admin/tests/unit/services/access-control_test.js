import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | access-control', function (hooks) {
  setupTest(hooks);

  module('#restrictAccessTo', function () {
    module('when user does not have the given role', function () {
      test('it should be redirected to the given redirection url', function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isCertif: true };

        const router = this.owner.lookup('service:router');
        router.transitionTo = sinon.stub();

        const service = this.owner.lookup('service:access-control');

        // when
        service.restrictAccessTo(['isSuperAdmin'], 'authenticated');

        // then
        assert.ok(router.transitionTo.calledWith('authenticated'));
      });
    });

    module('when user has the given role', function () {
      test('it should not be redirected', function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        const router = this.owner.lookup('service:router');
        router.transitionTo = sinon.stub();

        const service = this.owner.lookup('service:access-control');

        // when
        service.restrictAccessTo(['isSuperAdmin'], 'authenticated');

        // then
        assert.ok(router.transitionTo.notCalled);
      });
    });
  });

  module('#hasAccessToUsersActionsScope', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: true },
      { role: 'isMetier', hasAccess: false },
      { role: 'isCertif', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToUsersActionsScope, hasAccess);
      });
    });
  });

  module('#hasAccessToTargetProfilesActionsScope', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: true },
      { role: 'isMetier', hasAccess: true },
      { role: 'isCertif', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToTargetProfilesActionsScope, hasAccess);
      });
    });
  });

  module('#hasAccessToTrainingsActionsScope', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: false },
      { role: 'isMetier', hasAccess: true },
      { role: 'isCertif', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToTrainingsActionsScope, hasAccess);
      });
    });
  });

  module('#hasAccessToTrainings', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: true },
      { role: 'isMetier', hasAccess: true },
      { role: 'isCertif', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToTrainings, hasAccess);
      });
    });
  });

  module('#hasAccessToOrganizationActionsScope', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: true },
      { role: 'isMetier', hasAccess: true },
      { role: 'isCertif', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToOrganizationActionsScope, hasAccess);
      });
    });
  });

  module('#hasAccessToCertificationActionsScope', function () {
    [
      { role: 'isSuperAdmin', hasAccess: true },
      { role: 'isSupport', hasAccess: true },
      { role: 'isCertif', hasAccess: true },
      { role: 'isMetier', hasAccess: false },
    ].forEach(function ({ role, hasAccess }) {
      test(`should be ${hasAccess} if current admin member is ${role}`, function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { [role]: true };

        const service = this.owner.lookup('service:access-control');

        // when / then
        assert.deepEqual(service.hasAccessToCertificationActionsScope, hasAccess);
      });
    });
  });

  module('#hasAccessToOrganizationPlacesActionsScope', function () {
    test('should be true if current admin member is Super admin', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToOrganizationPlacesActionsScope);
    });

    test('should be true if user is Metier', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isMetier: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToOrganizationPlacesActionsScope);
    });

    test('should be false if user is Support', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSupport: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToOrganizationPlacesActionsScope);
    });

    test('should be false if user is Certif', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isCertif: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToOrganizationPlacesActionsScope);
    });
  });

  module('#hasAccessToCampaignIsForAbsoluteNoviceEditionScope', function () {
    test('should be true if current admin member is Super admin', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToCampaignIsForAbsoluteNoviceEditionScope);
    });

    test('should be false if user is Metier', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isMetier: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToCampaignIsForAbsoluteNoviceEditionScope);
    });

    test('should be false if user is Support', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSupport: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToCampaignIsForAbsoluteNoviceEditionScope);
    });

    test('should be false if user is Certif', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isCertif: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToCampaignIsForAbsoluteNoviceEditionScope);
    });
  });

  module('#hasAccessToAttachChildOrganizationActionsScope', function () {
    module(`when user has role "SUPER_ADMIN"`, function () {
      test(`returns "true"`, function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        const service = this.owner.lookup('service:access-control');
        currentUser.adminMember = { isSuperAdmin: true };

        // then
        assert.true(service.hasAccessToAttachChildOrganizationActionsScope);
      });
    });

    [
      { role: 'METIER', roleKey: 'isMetier', hasAccess: false },
      { role: 'CERTIF', roleKey: 'isCertif', hasAccess: false },
      { role: 'SUPPORT', roleKey: 'isSupport', hasAccess: false },
    ].forEach(({ role, roleKey, hasAccess }) => {
      module(`when user has role "${role}"`, function () {
        test(`returns "${hasAccess}"`, function (assert) {
          // given
          const currentUser = this.owner.lookup('service:currentUser');
          const service = this.owner.lookup('service:access-control');
          currentUser.adminMember = { [roleKey]: hasAccess };

          // then
          assert.false(service.hasAccessToAttachChildOrganizationActionsScope);
        });
      });
    });
  });
});
