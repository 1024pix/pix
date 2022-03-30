import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User details personal information', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  async function buildAndAuthenticateUser(server, { email, username }) {
    const schoolingRegistration = server.create('schooling-registration', { firstName: 'John' });
    const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
    const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
    const user = server.create('user', {
      'first-name': 'john',
      'last-name': 'harry',
      email,
      username,
      'is-authenticated-from-gar': false,
    });
    user.schoolingRegistrations = [schoolingRegistration];
    user.authenticationMethods = [pixAuthenticationMethod, garAuthenticationMethod];
    user.save();
    await createAuthenticateSession({ userId: user.id });

    return user;
  }

  test('visiting /users/:id', async function (assert) {
    // when
    const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
    await visit(`/users/${user.id}`);

    // then
    assert.deepEqual(currentURL(), `/users/${user.id}`);
  });

  module('when administrator click to edit users details', function () {
    test('should update user firstName, lastName and email', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      const screen = await visitScreen(`/users/${user.id}`);
      await clickByName('Modifier');

      // when
      await fillByLabel('* Prénom :', 'john');
      await fillByLabel('* Nom :', 'doe');
      await fillByLabel('* Adresse e-mail :', 'john.doe@example.net');

      await clickByName('Editer');

      // then
      assert.dom(screen.getByText('john')).exists();
      assert.dom(screen.getByText('doe')).exists();
      assert.dom(screen.getByText('john.doe@example.net')).exists();
    });

    test('should update user firstName, lastName and username', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: null, username: 'john.harry0101' });
      const screen = await visitScreen(`/users/${user.id}`);
      await clickByName('Modifier');

      // when
      await fillByLabel('* Prénom :', 'john');
      await fillByLabel('* Nom :', 'doe');
      await fillByLabel('* Identifiant :', 'john.doe0101');

      await clickByName('Editer');

      // then
      assert.dom(screen.getByText('john')).exists();
      assert.dom(screen.getByText('doe')).exists();
      assert.dom(screen.getByText('john.doe0101')).exists();
    });
  });

  module('when administrator click on anonymize button and confirm modal', function () {
    test('should anonymize the user and remove all authentication methods', async function (assert) {
      // given
      await buildAndAuthenticateUser(this.server, {
        email: 'john.harry@example.net',
        username: 'john.harry121297',
      });

      const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
      const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
      const userToAnonymise = server.create('user', {
        firstName: 'Jane',
        lastName: 'Harry',
        email: 'jane.harry@example.net',
        username: 'jane.harry050697',
        isAuthenticatedFromGar: false,
        authenticationMethods: [pixAuthenticationMethod, garAuthenticationMethod],
      });

      const screen = await visitScreen(`/users/${userToAnonymise.id}`);
      await clickByName('Anonymiser cet utilisateur');

      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText(`prenom_${userToAnonymise.id}`)).exists();
      assert.dom(screen.getByText(`nom_${userToAnonymise.id}`)).exists();
      assert.dom(screen.getByText(`email_${userToAnonymise.id}@example.net`)).exists();

      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Pôle Emploi")).exists();
    });
  });

  module('when administrator click on dissociate button', function () {
    test('should not display registration any more', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      const organizationName = 'Organisation_to_dissociate_of';
      const schoolingRegistrationToDissociate = this.server.create('schooling-registration', {
        id: 10,
        organizationName,
        canBeDissociated: true,
      });
      user.schoolingRegistrations.models.push(schoolingRegistrationToDissociate);
      user.save();

      const screen = await visitScreen(`/users/${user.id}`);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      // when
      await clickByName('Oui, je dissocie');

      // then
      assert.deepEqual(currentURL(), `/users/${user.id}`);
      assert.dom(screen.queryByText('Organisation_to_dissociate_of')).doesNotExist();
    });
  });

  module('when administrator click on remove authentication method button', function () {
    test('should not display remove link and display unchecked icon', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      const screen = await visitScreen(`/users/${user.id}`);

      // when
      await click('button[data-test-remove-email]');
      await clickByName('Oui, je supprime');

      // then
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.queryByText('Supprimer')).doesNotExist();
    });
  });
});
