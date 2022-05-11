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

  module('#hasAccessToOrganizationActionsScope', function () {
    test('should be true if user is Super Admin', function (assert) {
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
});
