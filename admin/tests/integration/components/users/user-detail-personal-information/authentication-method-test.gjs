import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import AuthenticationMethod from 'pix-admin/components/users/user-detail-personal-information/authentication-method';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users | user-detail-personal-information | authentication-method', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the admin member has access to users actions scope', function (hooks) {
    const stub = class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    };
    hooks.beforeEach(function () {
      this.owner.register('service:access-control', stub);
    });

    module('When user has authentication methods', function () {
      module('when user has confirmed his email address', function () {
        test('should display email confirmed date', async function (assert) {
          // given
          const user = { emailConfirmedAt: new Date('2020-10-30'), authenticationMethods: [] };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          assert
            .dom(
              screen.getAllByRole('listitem').find((listItem) => {
                const childrenText = listItem.textContent.trim().split('\n');
                return (
                  childrenText[0]?.trim() === 'Adresse e-mail confirmée le :' &&
                  childrenText[1]?.trim() === '30/10/2020'
                );
              }),
            )
            .exists();
        });
      });

      module('when user has not confirmed their email address', function () {
        test('it should display "Adresse e-mail non confirmée"', async function (assert) {
          // given
          const user = { emailConfirmedAt: null, authenticationMethods: [] };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          assert
            .dom(
              screen
                .getAllByRole('listitem')
                .find((listItem) => listItem.textContent?.trim() === 'Adresse e-mail non confirmée'),
            )
            .exists();
        });
      });

      module('when user has a PIX authentication method', function () {
        test('it displays user has to change password', async function (assert) {
          // given
          const user = {
            authenticationMethods: [
              {
                identityProvider: 'PIX',
                authenticationComplement: { shouldChangePassword: true },
              },
            ],
          };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          const expectedLabel = t(
            'components.users.user-detail-personal-information.authentication-method.should-change-password-status',
          );
          const expectedValue = t('common.words.yes');
          assert
            .dom(
              screen.getAllByRole('listitem').find((listItem) => {
                const childrenText = listItem.textContent.trim().split('\n');
                return childrenText[0]?.trim() === expectedLabel && childrenText[1]?.trim() === expectedValue;
              }),
            )
            .exists();
        });

        test('it displays user has not to change password', async function (assert) {
          // given
          const user = {
            authenticationMethods: [
              {
                identityProvider: 'PIX',
                authenticationComplement: { shouldChangePassword: false },
              },
            ],
          };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          const expectedLabel = t(
            'components.users.user-detail-personal-information.authentication-method.should-change-password-status',
          );
          const expectedValue = t('common.words.no');
          assert
            .dom(
              screen.getAllByRole('listitem').find((listItem) => {
                const childrenText = listItem.textContent.trim().split('\n');
                return childrenText[0]?.trim() === expectedLabel && childrenText[1]?.trim() === expectedValue;
              }),
            )
            .exists();
        });

        module('when user has a last login date', function () {
          test('it displays the last login date for PIX authentication method', async function (assert) {
            // given
            const user = {
              authenticationMethods: [
                {
                  identityProvider: 'PIX',
                  authenticationComplement: {},
                  lastLoggedAt: new Date('2022-07-01T00:00:00Z'),
                },
              ],
            };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            const expectedLabel = t(
              'components.users.user-detail-personal-information.authentication-method.last-logged-at',
            );
            const expectedValue = '01/07/2022';
            assert
              .dom(
                screen.getAllByRole('listitem').find((listItem) => {
                  const childrenText = listItem.textContent.trim().split('\n');
                  return childrenText[0]?.trim() === expectedLabel && childrenText[1]?.trim() === expectedValue;
                }),
              )
              .exists();
          });
        });
        module('when user has no last login date', function () {
          test('it displays last login default date for PIX authentication method', async function (assert) {
            // given
            const user = {
              authenticationMethods: [
                {
                  identityProvider: 'PIX',
                  authenticationComplement: {},
                  lastLoggedAt: null,
                },
              ],
            };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);
            // then
            const lastLoginDefaultDate = t(
              'components.users.user-detail-personal-information.authentication-method.no-last-connection-date-info',
            );
            assert.strictEqual(screen.getAllByText(lastLoginDefaultDate).length, 2);
          });
        });
      });

      module('email authentication method', function () {
        module('when user has email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            const user = { email: 'pix.aile@example.net', authenticationMethods: [{ identityProvider: 'PIX' }] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
          });
        });

        module('when user does not have email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            const user = { authenticationMethods: [] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

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
            const user = { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec identifiant")).exists();
          });
        });

        module('when user does not have username authentication method', function () {
          test('should display information', async function (assert) {
            // given
            const user = { authenticationMethods: [] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

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
            const user = { authenticationMethods: [{ identityProvider: 'GAR' }] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Médiacentre")).exists();
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
          });
        });

        module('when user does not have gar authentication method', function () {
          test('should display information', async function (assert) {
            // given
            const user = { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

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

        module('when user does not have "Sunlight Navigations" authentication method', function () {
          test('should display information', async function (assert) {
            // given
            const user = { authenticationMethods: [] };
            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert
              .dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Sunlight Navigations"))
              .exists();
          });
        });

        module('when user has one or more authentication methods', function () {
          test('should display information, delete and reassign buttons', async function (assert) {
            // given
            const toggleDisplayRemoveAuthenticationMethodModalStub = sinon.stub();
            const user = {
              username: 'PixAile',
              authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'SUNLIGHT_NAVIGATIONS' }],
            };

            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(
              <template>
                <AuthenticationMethod
                  @user={{user}}
                  @toggleDisplayRemoveAuthenticationMethodModal={{toggleDisplayRemoveAuthenticationMethodModalStub}}
                />
              </template>,
            );
            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Sunlight Navigations")).exists();
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
            assert.strictEqual(screen.getAllByRole('button', { name: 'Supprimer' }).length, 2);
          });
          test('should not display delete and reassign buttons', async function (assert) {
            // given
            const toggleDisplayRemoveAuthenticationMethodModalStub = sinon.stub();
            const user = {
              username: 'PixAile',
              authenticationMethods: [{ identityProvider: 'PIX' }],
            };

            this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

            // when
            const screen = await render(
              <template>
                <AuthenticationMethod
                  @user={{user}}
                  @toggleDisplayRemoveAuthenticationMethodModal={{toggleDisplayRemoveAuthenticationMethodModalStub}}
                />
              </template>,
            );
            // then
            assert.dom(screen.queryByRole('button', { name: 'Déplacer cette méthode de connexion' })).doesNotExist();
            assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
            assert.ok(
              screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Sunlight Navigations", {
                exact: false,
              }),
            );
          });
        });
      });

      module('When user has only one authentication method', function () {
        test('it should not display a remove authentication method link', async function (assert) {
          // given
          const user = { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
        });

        test('it should display reassign button if it is the last authentication method', async function (assert) {
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
          this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

          // given
          const user = {
            username: 'PixAile',
            authenticationMethods: [{ identityProvider: 'SUNLIGHT_NAVIGATIONS' }],
          };

          // when
          const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

          // then
          assert.ok(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' }));
          assert.ok(screen.getByLabelText("L'utilisateur a une méthode de connexion Sunlight Navigations"));
        });

        module('When user does not have pix authentication method', function () {
          test('it should display add authentication method button', async function (assert) {
            // given
            const user = {
              authenticationMethods: [],
            };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert.dom(screen.getByRole('button', { name: 'Ajouter une adresse e-mail' })).exists();
          });
        });

        module('When user has a pix authentication method', function () {
          test('it should not display add authentication method button', async function (assert) {
            // given
            const user = { username: 'PixAile', authenticationMethods: [{ identityProvider: 'PIX' }] };

            // when
            const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

            // then
            assert.dom(screen.queryByRole('button', { name: 'Ajouter une adresse e-mail' })).doesNotExist();
          });
        });
      });
    });

    test('it displays last application connections', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const user = store.createRecord('user', {
        username: 'PixAile',
        authenticationMethods: [store.createRecord('authentication-method', { identityProvider: 'PIX' })],
        lastApplicationConnections: [
          store.createRecord('last-application-connection', {
            application: 'app',
            lastLoggedAt: new Date('2022-05-01T00:00:00Z'),
          }),
          store.createRecord('last-application-connection', {
            application: 'orga',
            lastLoggedAt: new Date('2022-01-01T00:00:00Z'),
          }),
          store.createRecord('last-application-connection', {
            application: 'certif',
            lastLoggedAt: new Date('2022-02-01T00:00:00Z'),
          }),
        ],
      });

      // when
      const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

      // then
      assert.dom(screen.getByText('Date de dernière connexion Pix App : 01/05/2022')).exists();
      assert.dom(screen.getByText('Date de dernière connexion Pix Orga : 01/01/2022')).exists();
      assert.dom(screen.getByText('Date de dernière connexion Pix Certif : 01/02/2022')).exists();
    });
  });

  module('When the admin member does not have access to users actions scope', function () {
    test('it should not be able to see action buttons "Supprimer" and "Déplacer cette méthode de connexion"', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToUsersActionsScope = false;
      }
      const user = {
        username: 'PixAile',
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'GAR' }],
      };
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(<template><AuthenticationMethod @user={{user}} /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Déplacer cette méthode de connexion' })).doesNotExist();
    });
  });
});
