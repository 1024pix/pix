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
    test('should be true if admin member has role "SUPER_ADMIN"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSuperAdmin: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToUsersActionsScope);
    });

    test('should be true if admin member has role "SUPPORT"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSupport: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToUsersActionsScope);
    });

    test('should be false if admin member has role "CERTIF" or "METIER"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSuperAdmin: false, isSupport: false };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.false(service.hasAccessToUsersActionsScope);
    });
  });

  module('#hasAccessToTargetProfilesActionsScope', function () {
    test('should be true if admin member has role "SUPER_ADMIN"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSuperAdmin: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTargetProfilesActionsScope);
    });

    test('should be true if admin member has role "SUPPORT"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSupport: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTargetProfilesActionsScope);
    });

    test('should be true if admin member has role "METIER"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isMetier: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTargetProfilesActionsScope);
    });

    test('should be false if admin member has role "CERTIF"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isCertif: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.false(service.hasAccessToTargetProfilesActionsScope);
    });
  });

  module('#hasAccessToTrainingsActionsScope', function () {
    test('should be true if admin member has role "SUPER_ADMIN"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSuperAdmin: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTrainingsActionsScope);
    });

    test('should be true if admin member has role "SUPPORT"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isSupport: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTrainingsActionsScope);
    });

    test('should be true if admin member has role "METIER"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isMetier: true };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.true(service.hasAccessToTrainingsActionsScope);
    });

    test('should be false if admin member has role "CERTIF"', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      currentUser.adminMember = { isCertif: true, isMetier: false, isSuperAdmin: false, isSupport: false };
      const service = this.owner.lookup('service:access-control');

      // when & then
      assert.false(service.hasAccessToTrainingsActionsScope);
    });
  });

  module('#hasAccessToOrganizationActionsScope', function () {
    test('should be true if current admin member is Super Admin', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToOrganizationActionsScope);
    });

    test('should be true if user is Support', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSupport: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToOrganizationActionsScope);
    });

    test('should be true if user is Metier', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isMetier: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToOrganizationActionsScope);
    });

    test('should be false if user is Certif', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isCertif: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToOrganizationActionsScope);
    });
  });

  module('#hasAccessToCertificationActionsScope', function () {
    test('should be true if current admin member is Super admin', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToCertificationActionsScope);
    });

    test('should be true if user is Support', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSupport: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToCertificationActionsScope);
    });

    test('should be true if user is Certif', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isCertif: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.true(service.hasAccessToCertificationActionsScope);
    });

    test('should be false if user is Metier', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isMetier: true };

      const service = this.owner.lookup('service:access-control');

      // when / then
      assert.false(service.hasAccessToCertificationActionsScope);
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
});
