import { module, test } from 'qunit';
import { currentURL, click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import getByLabel from '../helpers/extended-ember-test-helpers/get-by-label';

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), `/users/${user.id}`);
  });

  module('when administrator click to edit users details', function () {
    test('should update user firstName, lastName and email', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      await visit(`/users/${user.id}`);
      await clickByLabel('Modifier');

      // when
      await fillIn('#firstName', 'john');
      await fillIn('#lastName', 'doe');
      await fillIn('#email', 'john.doe@example.net');

      await clickByLabel('Editer');

      // then
      assert.contains('john');
      assert.contains('doe');
      assert.contains('john.doe@example.net');
    });

    test('should update user firstName, lastName and username', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: null, username: 'john.harry0101' });
      await visit(`/users/${user.id}`);
      await clickByLabel('Modifier');

      // when
      await fillIn('#firstName', 'john');
      await fillIn('#lastName', 'doe');
      await fillIn('#username', 'john.doe0101');

      await clickByLabel('Editer');

      // then
      assert.contains('john');
      assert.contains('doe');
      assert.contains('john.doe0101');
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

      await visit(`/users/${userToAnonymise.id}`);
      await clickByLabel('Anonymiser cet utilisateur');

      // when
      await clickByLabel('Confirmer');

      // then
      assert.contains(`prenom_${userToAnonymise.id}`);
      assert.contains(`nom_${userToAnonymise.id}`);
      assert.contains(`email_${userToAnonymise.id}@example.net`);

      assert.dom(getByLabel("L'utilisateur n'a pas de méthode de connexion avec identifiant")).exists();
      assert.dom(getByLabel("L'utilisateur n'a pas de méthode de connexion avec GAR")).exists();
      assert.dom(getByLabel("L'utilisateur n'a pas de méthode de connexion avec Pôle Emploi")).exists();
      assert.dom(getByLabel("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
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
      });
      user.schoolingRegistrations.models.push(schoolingRegistrationToDissociate);
      user.save();

      await visit(`/users/${user.id}`);
      await click('button[data-test-dissociate-schooling-registration="10"]');

      // when
      await clickByLabel('Oui, je dissocie');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), `/users/${user.id}`);
      assert.notContains(organizationName);
    });
  });

  module('when administrator click on remove authentication method button', function () {
    test('should not display remove link and display unchecked icon', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      await visit(`/users/${user.id}`);

      // when
      await click('button[data-test-remove-email]');
      await click('.modal-dialog .btn-primary');

      // then
      assert.dom(getByLabel("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
      assert.dom('button[data-test-remove-email]').notExists;
    });
  });
});
