import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import UserDetailAuthenticationMethods from 'pix-admin/components/users/user-detail-authentication-methods';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialogClose } from '../../../helpers/wait-for';

module('Integration | Component | users | user-detail-authentication-methods', function (hooks) {
  setupIntlRenderingTest(hooks);

  class AccessControlStub extends Service {
    hasAccessToUsersActionsScope = true;
  }

  module('when the admin member click on remove authentication method button', function () {
    test('should display remove authentication methode confirm modal', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
      });

      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(<template><UserDetailAuthenticationMethods @user={{user}} /></template>);

      // when
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Confirmer la suppression' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Oui, je supprime' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByText('Suppression de la méthode de connexion suivante : Adresse e-mail')).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
      });

      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(<template><UserDetailAuthenticationMethods @user={{user}} /></template>);
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Annuler' }));
      await waitForDialogClose();

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Confirmer la suppression' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Oui, je supprime' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    });

    module('when the admin member confirm the removal', function () {
      test('should call removeAuthenticationMethod parameter', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: 'john.harry.1010',
          authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
        });

        this.owner.register('service:access-control', AccessControlStub);
        const removeAuthenticationMethodStub = sinon.stub();

        const screen = await render(
          <template>
            <UserDetailAuthenticationMethods
              @user={{user}}
              @removeAuthenticationMethod={{removeAuthenticationMethodStub}}
            />
          </template>,
        );
        await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Oui, je supprime' }));

        // then
        assert.ok(removeAuthenticationMethodStub.called);
      });
    });
  });

  module('when there is only one authentication method', function () {
    test('it should not be possible de remove the last authentication method', async function (assert) {
      // given
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

      const user = EmberObject.create({
        lastName: 'Pix',
        firstName: 'Aile',
        email: 'pix.aile@gmail.com',
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });

      this.owner.register('service:access-control', AccessControlStub);
      this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);
      const screen = await render(<template><UserDetailAuthenticationMethods @user={{user}} /></template>);

      // when & then
      assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Sunlight Navigations")).exists();
      assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
    });
  });
});
