import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createPrescriberByUser, createUserMembershipWithRole } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
    await visit('/equipe');
    await clickByName('Gérer');
    await clickByName('Supprimer');

    // when
    await click('button[data-test-modal-remove-button]');

    // then
    assert.contains(`${user.firstName} ${user.lastName} a été supprimé avec succès de votre équipe Pix Orga.`);
  });
});
