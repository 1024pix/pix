import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | users | user-detail-personal-information/authentication-method', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the admin member has access to users actions scope', function () {
    class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    }

    module('When user has authentication methods', function () {
      module('when user has confirmed his email address', function () {
        test('should display email confirmed date', async function (assert) {
          // given
          this.set('user', { emailConfirmedAt: new Date('2020-10-30'), authenticationMethods: [] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          assert.dom(screen.getByText('30/10/2020')).exists();
        });
      });

      module('when user has not confirmed their email address', function () {
        test('it should display "Adresse e-mail non confirmée"', async function (assert) {
          // given
          this.set('user', { emailConfirmedAt: null, authenticationMethods: [] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          assert.dom(screen.getByText('Adresse e-mail non confirmée')).exists();
        });
      });

      module('when last logged date exists', function () {
        test('should display date of latest connection', async function (assert) {
          // given
          this.set('user', { lastLoggedAt: new Date('2022-07-01'), authenticationMethods: [] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          assert.dom(screen.getByText('Date de dernière connexion :')).exists();
          assert.dom(screen.getByText('01/07/2022')).exists();
        });
      });

      module('when last logged date does not exist', function () {
        test('it should only display label', async function (assert) {
          // given
          this.set('user', { lastLoggedAt: null, authenticationMethods: [] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          assert.dom(screen.getByText('Date de dernière connexion :')).exists();
          assert.dom(screen.queryByText('Invalid date')).doesNotExist();
        });
      });

      module('when user has a PIX authentication method', function () {
        test('it displays the should change password status', async function (assert) {
          // given
          this.set('user', {
            authenticationMethods: [
              {
                identityProvider: 'PIX',
                authenticationComplement: { shouldChangePassword: true },
              },
            ],
          });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          const shouldChangePasswordLabelElement = screen.getByText(
            `${this.intl.t(
              'components.users.user-detail-personal-information.authentication-method.should-change-password-status'
            )}`
          );
          assert.dom(shouldChangePasswordLabelElement).exists();
          assert.dom(shouldChangePasswordLabelElement.nextElementSibling).hasText(this.intl.t('common.words.yes'));
        });
      });

      module('email authentication method', function () {
        module('when user has email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { email: 'pix.aile@example.net', authenticationMethods: [{ identityProvider: 'PIX' }] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
          });
        });

        module('when user does not have email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { authenticationMethods: [] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert
              .dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail"))
              .exists();
          });
        });
      });

      module('username authentication method', function () {
        module('when user has username authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec identifiant")).exists();
          });
        });

        module('when user does not have username authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { authenticationMethods: [] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert
              .dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant"))
              .exists();
          });
        });
      });

      module('gar authentication method', function () {
        module('when user has gar authentication method', function () {
          test('should display information and reassign authentication method button', async function (assert) {
            // given
            this.set('user', { authenticationMethods: [{ identityProvider: 'GAR' }] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Médiacentre")).exists();
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
          });
        });

        module('when user does not have gar authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
          });
        });
      });

      module('OIDC authentication method', function () {
        class OidcIdentityProvidersStub extends Service {
          get list() {
            return [
              {
                code: 'SUNLIGHT_NAVIGATIONS',
                organizationName: 'Sunlight Navigations',
              },
            ];
          }
        }

        module('when user has "Sunlight Navigations" authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', {
              authenticationMethods: [{ identityProvider: 'SUNLIGHT_NAVIGATIONS' }],
            });
            this.owner.register('service:access-control', AccessControlStub);
            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Sunlight Navigations")).exists();
          });
        });

        module('when user does not have "Sunlight Navigations" authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { authenticationMethods: [] });
            this.owner.register('service:access-control', AccessControlStub);
            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert
              .dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Sunlight Navigations"))
              .exists();
          });
        });

        module('when user has more authentication methods', function () {
          test('should display information, delete and reassign buttons', async function (assert) {
            // given
            const toggleDisplayRemoveAuthenticationMethodModalStub = sinon.stub();
            this.set('user', {
              username: 'PixAile',
              authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'SUNLIGHT_NAVIGATIONS' }],
            });
            this.set('toggleDisplayRemoveAuthenticationMethodModal', toggleDisplayRemoveAuthenticationMethodModalStub);
            this.owner.register('service:access-control', AccessControlStub);
            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod
  @user={{this.user}}
  @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
/>`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Sunlight Navigations")).exists();
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
            assert.strictEqual(screen.getAllByRole('button', { name: 'Supprimer' }).length, 2);
          });
        });
      });

      module('When user has only one authentication method', function () {
        test('it should not display a remove authentication method link', async function (assert) {
          // given
          this.set('user', { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
        });

        module('When user does not have pix authentication method', function () {
          test('it should display add authentication method button', async function (assert) {
            // given
            this.set('user', {
              authenticationMethods: [],
            });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.getByRole('button', { name: 'Ajouter une adresse e-mail' })).exists();
          });
        });

        module('When user has a pix authentication method', function () {
          test('it should not display add authentication method button', async function (assert) {
            // given
            this.set('user', { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(
              hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
            );

            // then
            assert.dom(screen.queryByRole('button', { name: 'Ajouter une adresse e-mail' })).doesNotExist();
          });
        });
      });
    });
  });

  module('When the admin member does not have access to users actions scope', function () {
    test('it should not be able to see action buttons "Supprimer" and "Déplacer cette méthode de connexion"', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToUsersActionsScope = false;
      }
      this.set('user', {
        username: 'PixAile',
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'GAR' }],
      });
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Déplacer cette méthode de connexion' })).doesNotExist();
    });
  });
});
