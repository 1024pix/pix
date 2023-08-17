import { clickByName, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserMembershipWithRole } from '../helpers/test-init';

async function createAuthenticatedSession() {
  const user = createUserMembershipWithRole('ADMIN');
  createPrescriberByUser(user);

  await authenticateSession(user.id);

  return user;
}

module('Acceptance | Remove membership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(async function () {
    const adminUser = await createAuthenticatedSession();
    const organizationId = adminUser.memberships.models.firstObject.organizationId;

    user = server.create('user', { firstName: 'John', lastName: 'Doe' });
    server.create('membership', { userId: user.id, organizationId, organizationRole: 'MEMBER' });
  });

  test('should remove the membership', async function (assert) {
    // given
    const screen = await visit('/equipe');
    await clickByName('Gérer');
    await clickByName('Supprimer');

    await screen.findByRole('dialog');

    // when
    await clickByName('Oui, supprimer le membre');

    // then
    assert.contains(`${user.firstName} ${user.lastName} a été supprimé avec succès de votre équipe Pix Orga.`);
  });
});
