import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createAuthenticateSession } from '../../../helpers/test-init';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';

module('Acceptance | authenticated/users | authentication-method', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should be possible to add a new Pix Authentication Method', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    const firstName = 'Alice';
    const lastName = 'Merveille';
    const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
    const userToAddNewEmail = server.create('user', {
      firstName,
      lastName,
      authenticationMethods: [garAuthenticationMethod],
    });

    // when
    await visit(`/users/${userToAddNewEmail.id}`);
    await clickByName('Ajouter une adresse e-mail');
    await fillByLabel('Nouvelle adresse e-mail', 'nouvel-email@example.net');
    await clickByName("Enregistrer l'adresse e-mail");

    // then
    assert.notContains('Nouvelle adresse e-mail');
    assert.contains(`nouvel-email@example.net a bien été rajouté aux méthodes de connexion de l'utilisateur`);
    assert.dom('tr[data-test-email] svg.authentication-method__check').exists();
  });

  test('should stay on modal if email already existing for an other user', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

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
    await visit(`/users/${userToAddNewEmail.id}`);
    await clickByName('Ajouter une adresse e-mail');
    await fillByLabel('Nouvelle adresse e-mail', 'nouvel-email@example.net');
    await clickByName("Enregistrer l'adresse e-mail");

    // then
    assert.contains('Nouvelle adresse e-mail');
    assert.contains('Cette adresse e-mail est déjà utilisée');
  });
});
