import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createAuthenticateSession } from '../../../helpers/test-init';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';

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
    await clickByLabel('Ajouter une adresse e-mail');
    await fillInByLabel('Nouvelle adresse e-mail', 'nouvel-email@example.net');
    await clickByLabel("Enregistrer l'email");

    // then
    assert.contains(`nouvel-email@example.net a bien été rajouté aux méthodes de connexion de l'utilisateur`);
    assert.dom('tr[data-test-email] svg.authentication-method__check').exists();
  });
});
