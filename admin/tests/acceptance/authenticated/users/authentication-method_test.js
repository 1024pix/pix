import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

module('Acceptance | authenticated/users | authentication-method', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when adding Pix authentication method', function () {
    test("should display Pix authentication method with email's information", async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const firstName = 'Alice';
      const lastName = 'Merveille';
      const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
      const userToAddNewEmail = server.create('user', {
        firstName,
        lastName,
        authenticationMethods: [garAuthenticationMethod],
      });

      // when
      const screen = await visit(`/users/${userToAddNewEmail.id}`);
      await clickByName('Ajouter une adresse e-mail');

      await screen.findByRole('dialog');

      await fillByLabel(/Nouvelle adresse e-mail/, 'nouvel-email@example.net');
      await clickByName("Enregistrer l'adresse e-mail");

      // then
      //assert.throws(screen.getByRole('textbox', { name: 'Nouvelle adresse e-mail' }));
      assert.dom(
        screen.getByText(`nouvel-email@example.net a bien été rajouté aux méthodes de connexion de l'utilisateur`)
      );
      assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
    });

    test('should stay on modal if email already existing for an other user', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const firstName = 'Alice';
      const lastName = 'Merveille';
      const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
      const userToAddNewEmail = server.create('user', {
        firstName,
        lastName,
        authenticationMethods: [garAuthenticationMethod],
      });
      server.create('user', { email: 'nouvel-email@example.net' });

      // when
      const screen = await visit(`/users/${userToAddNewEmail.id}`);
      await clickByName('Ajouter une adresse e-mail');

      await screen.findByRole('dialog');

      await fillByLabel(/Nouvelle adresse e-mail/, 'nouvel-email@example.net');
      await clickByName("Enregistrer l'adresse e-mail");

      // then
      assert.dom(screen.getByText('Nouvelle adresse e-mail')).exists();
      assert.dom(screen.getByText('Cette adresse e-mail est déjà utilisée')).exists();
    });
  });

  module('when reassign Gar authentication method', function () {
    test('should remove Gar authentication method information', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const firstName = 'Alice';
      const lastName = 'Merveille';
      const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
      const user = server.create('user', {
        firstName,
        lastName,
        authenticationMethods: [garAuthenticationMethod],
      });

      // when
      const screen = await visit(`/users/${user.id}`);
      await clickByName('Déplacer cette méthode de connexion');
      await fillByLabel("Id de l'utilisateur à qui vous souhaitez ajouter la méthode de connexion", 1);

      await screen.findByRole('dialog');

      await clickByName('Valider le déplacement');

      // then
      assert.dom(screen.getByText("La méthode de connexion a bien été déplacé vers l'utilisateur 1")).exists();
      assert.dom(screen.getByText("L'utilisateur n'a plus de méthode de connexion Médiacentre")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
      //assert.throws(screen.getByRole('button', { name: 'Valider le déplacement' }));
    });
  });

  module('when reassigning an oidc authentication method', function () {
    test('should remove the oidc authentication method information', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const firstName = 'Alice';
      const lastName = 'Merveille';
      const oidcAuthenticationMethod = server.create('authentication-method', {
        identityProvider: 'OIDC_PARTNER',
      });
      const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
      const user = server.create('user', {
        firstName,
        lastName,
        authenticationMethods: [pixAuthenticationMethod, oidcAuthenticationMethod],
      });

      // when
      const screen = await visit(`/users/${user.id}`);

      await click(screen.getByRole('button', { name: 'Déplacer cette méthode de connexion' }));

      await screen.findByRole('dialog');

      await fillByLabel("Id de l'utilisateur à qui vous souhaitez ajouter la méthode de connexion", 1);
      await click(screen.getByRole('button', { name: 'Valider le déplacement' }));

      // then
      assert.dom(screen.getByText("La méthode de connexion a bien été déplacé vers l'utilisateur 1")).exists();
      assert.dom(screen.getByText("L'utilisateur n'a plus de méthode de connexion Partenaire OIDC")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Partenaire OIDC")).exists();
      //assert.throws(screen.getByRole('button', { name: 'Valider le déplacement' }));
    });
  });

  module('when a user has multiple authentication methods', function () {
    test('it should be able to delete one of the authentication methods', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const firstName = 'Ayotunde';
      const lastName = 'Efemena';
      const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
      const oidcAuthenticationMethod = server.create('authentication-method', { identityProvider: 'OIDC_PARTNER' });
      const user = server.create('user', {
        firstName,
        lastName,
        authenticationMethods: [pixAuthenticationMethod, oidcAuthenticationMethod],
      });

      // when
      const screen = await visit(`/users/${user.id}`);
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[1]);

      await screen.findByRole('dialog');

      await click(screen.getByRole('button', { name: 'Oui, je supprime' }));

      // then
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Partenaire OIDC")).exists();
    });
  });
});
