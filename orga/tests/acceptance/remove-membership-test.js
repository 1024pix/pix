import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createPrescriberByUser, createUserMembershipWithRole,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

async function createAuthenticatedSession() {
  const user = createUserMembershipWithRole('ADMIN');
  createPrescriberByUser(user);

  await authenticateSession({
    user_id: user.id,
    access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });

  return user;
}

module('Acceptance | Remove membership', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(async function() {
    const adminUser = await createAuthenticatedSession();
    const organizationId = adminUser.memberships.models.firstObject.organizationId;

    user = server.create('user', { firstName: 'John', lastName: 'Doe' });
    server.create('membership', { userId: user.id, organizationId, organizationRole: 'MEMBER' });
  });

  test('should remove the membership', async (assert) => {
    // given
    await visit('/equipe');
    await clickByLabel('Afficher les actions');
    await clickByLabel('Supprimer');

    // when
    await click('button[data-test-modal-remove-button]');

    // then
    assert.notContains(user.firstName);
    assert.notContains(user.lastName);
  });
});
