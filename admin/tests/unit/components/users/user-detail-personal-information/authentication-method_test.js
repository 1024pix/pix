import { module, test } from 'qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Component | users | user-overview', function (hooks) {
  setupTest(hooks);
  module('#toggleReassignOidcAuthenticationMethodModal', function () {
    test('do not reinitialize userdId value', function (assert) {
      // given
      const reassignAuthenticationMethod = sinon.spy();
      const addPixAuthenticationMethod = sinon.spy();
      const user = {};
      const component = createGlimmerComponent(
        'component:users/user-detail-personal-information/authentication-method',
        {
          user,
          reassignAuthenticationMethod,
          addPixAuthenticationMethod,
        }
      );
      component.targetUserId = '12';
      component.showReassignOidcAuthenticationMethodModal = true;
      const oidcAuthenticationMethod = {
        code: 'CNAV',
        name: 'CNAV',
        hasAuthenticationMethod: true,
        canBeRemoved: true,
        canBeReassigned: true,
      };

      // when
      component.toggleReassignOidcAuthenticationMethodModal(oidcAuthenticationMethod);

      // then
      assert.deepEqual(component.selectedOidcAuthenticationMethod, oidcAuthenticationMethod);
      assert.false(component.showReassignOidcAuthenticationMethodModal);
      assert.strictEqual(component.targetUserId, '12');
    });
  });

  module('#shouldChangePassword', function () {
    module('when user has a PIX authentication method', function () {
      test('returns value provided', function (assert) {
        // given
        const reassignAuthenticationMethod = sinon.spy();
        const addPixAuthenticationMethod = sinon.spy();
        const user = {
          authenticationMethods: [
            {
              identityProvider: 'PIX',
              authenticationComplement: {
                shouldChangePassword: true,
              },
            },
          ],
        };
        const component = createGlimmerComponent(
          'component:users/user-detail-personal-information/authentication-method',
          {
            user,
            reassignAuthenticationMethod,
            addPixAuthenticationMethod,
          }
        );
        component.targetUserId = '12';

        // when && then
        assert.true(component.shouldChangePassword);
      });
    });
    module('when user has not a PIX authentication method', function () {
      test('returns false', function (assert) {
        // given
        const reassignAuthenticationMethod = sinon.spy();
        const addPixAuthenticationMethod = sinon.spy();
        const user = {
          authenticationMethods: [
            {
              identityProvider: 'CNAV',
              authenticationComplement: {},
            },
          ],
        };
        const component = createGlimmerComponent(
          'component:users/user-detail-personal-information/authentication-method',
          {
            user,
            reassignAuthenticationMethod,
            addPixAuthenticationMethod,
          }
        );
        component.targetUserId = '12';

        // when && then
        assert.false(component.shouldChangePassword);
      });
    });
  });
});
