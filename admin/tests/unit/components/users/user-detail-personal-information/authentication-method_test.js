import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | users | user-detail-personal-information/authentication-method', function (hooks) {
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
        },
      );
      component.targetUserId = '12';
      component.showReassignOidcAuthenticationMethodModal = true;
      const oidcAuthenticationMethod = {
        code: 'CNAV',
        name: 'CNAV',
        userHasThisOidcAuthenticationMethod: true,
        canBeRemovedFromUserAuthenticationMethods: true,
        canBeReassignedToAnotherUser: true,
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
          },
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
          },
        );
        component.targetUserId = '12';

        // when && then
        assert.false(component.shouldChangePassword);
      });
    });
  });

  module('#userOidcAuthenticationMethods', function () {
    module('when user has many authentication methods but no oidc', function () {
      test('returns oidc methods with actions that can be done on it all disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const oidcIdentityProvider1 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-1',
          organizationName: 'organization 1',
          hasLogoutUrl: false,
          source: 'source1',
        });
        const oidcIdentityProvider2 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-2',
          organizationName: 'organization 2',
          hasLogoutUrl: false,
          source: 'source2',
        });
        class OidcIdentittyProvidersStub extends Service {
          list = [oidcIdentityProvider1, oidcIdentityProvider2];
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentittyProvidersStub);

        const reassignAuthenticationMethod = sinon.spy();
        const addPixAuthenticationMethod = sinon.spy();

        // user
        const pixAuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
        const garAuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });

        const user = store.createRecord('user', {
          email: 'email@example.net',
          id: 5,
          authenticationMethods: [pixAuthenticationMethod, garAuthenticationMethod],
        });
        const component = createGlimmerComponent(
          'component:users/user-detail-personal-information/authentication-method',
          {
            user,
            reassignAuthenticationMethod,
            addPixAuthenticationMethod,
          },
        );

        // when && then
        const expected = [
          {
            canBeReassignedToAnotherUser: false,
            canBeRemovedFromUserAuthenticationMethods: false,
            code: 'OIDC-1',
            name: 'organization 1',
            userHasThisOidcAuthenticationMethod: false,
          },
          {
            canBeReassignedToAnotherUser: false,
            canBeRemovedFromUserAuthenticationMethods: false,
            code: 'OIDC-2',
            name: 'organization 2',
            userHasThisOidcAuthenticationMethod: false,
          },
        ];
        assert.deepEqual(component.userOidcAuthenticationMethods, expected);
      });
    });
    module('when user has many authentication methods including oidc', function () {
      test('returns oidc methods with actions that can be done on it', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const oidcIdentityProvider1 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-1',
          organizationName: 'organization 1',
          hasLogoutUrl: false,
          source: 'source1',
        });
        const oidcIdentityProvider2 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-2',
          organizationName: 'organization 2',
          hasLogoutUrl: false,
          source: 'source2',
        });
        class OidcIdentittyProvidersStub extends Service {
          list = [oidcIdentityProvider1, oidcIdentityProvider2];
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentittyProvidersStub);

        const reassignAuthenticationMethod = sinon.spy();
        const addPixAuthenticationMethod = sinon.spy();

        // user
        const pixAuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
        const garAuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
        const Oidc2AuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'OIDC-2' });

        const user = store.createRecord('user', {
          email: 'email@example.net',
          id: 5,
          authenticationMethods: [pixAuthenticationMethod, garAuthenticationMethod, Oidc2AuthenticationMethod],
        });
        const component = createGlimmerComponent(
          'component:users/user-detail-personal-information/authentication-method',
          {
            user,
            reassignAuthenticationMethod,
            addPixAuthenticationMethod,
          },
        );

        // when && then
        const expected = [
          {
            canBeReassignedToAnotherUser: false,
            canBeRemovedFromUserAuthenticationMethods: false,
            code: 'OIDC-1',
            name: 'organization 1',
            userHasThisOidcAuthenticationMethod: false,
          },
          {
            canBeReassignedToAnotherUser: true,
            canBeRemovedFromUserAuthenticationMethods: true,
            code: 'OIDC-2',
            name: 'organization 2',
            userHasThisOidcAuthenticationMethod: true,
          },
        ];
        assert.deepEqual(component.userOidcAuthenticationMethods, expected);
      });
    });
    module('When user has only one oidc authentication method left and no other method', function () {
      test('oidc authentication method can be reassigned', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const oidcIdentityProvider1 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-1',
          organizationName: 'organization 1',
          hasLogoutUrl: false,
          source: 'source1',
        });
        const oidcIdentityProvider2 = store.createRecord('oidc-identity-provider', {
          code: 'OIDC-2',
          organizationName: 'organization 2',
          hasLogoutUrl: false,
          source: 'source2',
        });
        class OidcIdentittyProvidersStub extends Service {
          list = [oidcIdentityProvider1, oidcIdentityProvider2];
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentittyProvidersStub);

        const reassignAuthenticationMethod = sinon.spy();
        const addPixAuthenticationMethod = sinon.spy();

        // user
        const Oidc2AuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'OIDC-2' });

        const user = store.createRecord('user', {
          email: 'email@example.net',
          id: 5,
          authenticationMethods: [Oidc2AuthenticationMethod],
        });
        const component = createGlimmerComponent(
          'component:users/user-detail-personal-information/authentication-method',
          {
            user,
            reassignAuthenticationMethod,
            addPixAuthenticationMethod,
          },
        );

        // when && then
        const expected = [
          {
            canBeReassignedToAnotherUser: false,
            canBeRemovedFromUserAuthenticationMethods: false,
            code: 'OIDC-1',
            name: 'organization 1',
            userHasThisOidcAuthenticationMethod: false,
          },
          {
            canBeReassignedToAnotherUser: true,
            canBeRemovedFromUserAuthenticationMethods: false,
            code: 'OIDC-2',
            name: 'organization 2',
            userHasThisOidcAuthenticationMethod: true,
          },
        ];
        assert.deepEqual(component.userOidcAuthenticationMethods, expected);
      });
    });
  });
});
