import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';

module('Integration | Component | users | user-detail-personal-information/authentication-method', function (hooks) {
  setupRenderingTest(hooks);

  module('When the admin member has access to users actions scope', function () {
    class AccessControlStub extends Service {
      hasAccessToUsersActionsScope = true;
    }

    module('When user has authentication methods', function () {
      module('when user has confirmed his email address', function () {
        test('should display email confirmed date', async function (assert) {
          // given
          this.set('user', { emailConfirmedAt: new Date('2020-10-30') });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`
            <Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('30/10/2020')).exists();
        });
      });

      module('when user has not confirmed their email address', function () {
        test('it should display "Adresse e-mail non confirmée"', async function (assert) {
          // given
          this.set('user', { emailConfirmedAt: null });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`
            <Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('Adresse e-mail non confirmée')).exists();
        });
      });

      module('when last logged date exists', function () {
        test('should display date of latest connection', async function (assert) {
          // given
          this.set('user', { lastLoggedAt: new Date('2022-07-01') });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`
            <Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('Date de dernière connexion :')).exists();
          assert.dom(screen.getByText('01/07/2022')).exists();
        });
      });

      module('when last logged date does not exist', function () {
        test('it should only display label', async function (assert) {
          // given
          this.set('user', { lastLoggedAt: null });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`
            <Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}} />`);

          // then
          assert.dom(screen.getByText('Date de dernière connexion :')).exists();
          assert.dom(screen.queryByText('Invalid date')).doesNotExist();
        });
      });

      module('email authentication method', function () {
        module('when user has email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasEmailAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
          });
        });

        module('when user does not have email authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasEmailAuthenticationMethod: false, hasCnavAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

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
            this.set('user', { hasUsernameAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec identifiant")).exists();
          });
        });

        module('when user does not have username authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasUsernameAuthenticationMethod: false, hasCnavAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert
              .dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant"))
              .exists();
          });
        });
      });

      module('pole emploi authentication method', function () {
        module('when user has pole emploi authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasPoleEmploiAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Pôle Emploi")).exists();
          });

          test('should display reassign authentication method button', async function (assert) {
            // given
            this.set('user', {
              hasPoleEmploiAuthenticationMethod: true,
            });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
          />`);

            // then
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
          });
        });

        module('when user does not have pole emploi authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasPoleEmploiAuthenticationMethod: false, hasCnavAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Pôle Emploi")).exists();
          });
        });
      });

      module('gar authentication method', function () {
        module('when user has gar authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasGarAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion Médiacentre")).exists();
          });

          test('it should display reassign authentication method button', async function (assert) {
            // given
            this.set('user', {
              hasGarAuthenticationMethod: true,
            });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
          />`);

            // then
            assert.dom(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' })).exists();
          });
        });

        module('when user does not have gar authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasGarAuthenticationMethod: false, hasCnavAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
          });
        });
      });

      module('cnav authentication method', function () {
        module('when user has cnav authentication method', function () {
          module('and another authentication method', function () {
            test('it should display a delete button', async function (assert) {
              // given
              this.set('user', {
                hasCnavAuthenticationMethod: true,
                hasEmailAuthenticationMethod: true,
                isAllowedToRemoveCnavAuthenticationMethod: true,
              });
              this.set('toggleDisplayRemoveAuthenticationMethodModal', function () {});
              this.owner.register('service:access-control', AccessControlStub);

              // when
              const screen = await render(hbs`
              <Users::UserDetailPersonalInformation::AuthenticationMethod
                @user={{this.user}}
                @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
              />
              `);

              // then
              assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
            });
          });

          test('should display information', async function (assert) {
            // given
            this.set('user', { hasCnavAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion CNAV")).exists();
          });
        });

        module('when user does not have cnav authentication method', function () {
          test('should display information', async function (assert) {
            // given
            this.set('user', { hasUsernameAuthenticationMethod: true, hasCnavAuthenticationMethod: false });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

            // then
            assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion CNAV")).exists();
          });
        });
      });

      module('When user has only one authentication method', function () {
        test('it should not display a remove authentication method link', async function (assert) {
          // given
          this.set('user', { hasOnlyOneAuthenticationMethod: true });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
        />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
        });

        module('When user does not have pix authentication method', function () {
          test('it should display add authentication method button', async function (assert) {
            // given
            this.set('user', {
              isAllowedToAddEmailAuthenticationMethod: true,
              hasOnlyOneAuthenticationMethod: true,
              hasPixAuthenticationMethod: false,
            });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
          />`);

            // then
            assert.dom(screen.getByRole('button', { name: 'Ajouter une adresse e-mail' })).exists();
          });
        });

        module('When user has a pix authentication method', function () {
          test('it should not display add authentication method button', async function (assert) {
            // given
            this.set('user', { hasOnlyOneAuthenticationMethod: true, hasPixAuthenticationMethod: true });
            this.owner.register('service:access-control', AccessControlStub);

            // when
            const screen = await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
          />`);

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
        isAllowedToRemoveGarAuthenticationMethod: true,
        hasGarAuthenticationMethod: true,
      });
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::AuthenticationMethod @user={{this.user}}/>`
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Déplacer cette méthode de connexion' })).doesNotExist();
    });
  });
});
