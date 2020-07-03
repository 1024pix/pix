import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createPrescriberByUser, createUserManagingStudents
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

async function createAuthenticatedSession() {
  const user = createUserManagingStudents('ADMIN');
  createPrescriberByUser(user);

  await authenticateSession({
    user_id: user.id,
    access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });

  return user;
}

const DASH_CHARACTER = '\u2013';
module('Acceptance | Student List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;
  let organizationId;

  hooks.beforeEach(async function() {
    user = await createAuthenticatedSession();
  });

  module('when the student is dissociated from the user', function() {

    test('it does not display the action button', async function(assert) {
      organizationId = user.memberships.models.firstObject.organizationId;

      server.create('student', {
        organizationId,
        id: 1,
        firstName: 'Ellen Louise',
        lastName: 'Ripley',
        email: 'ellen@ripley.com',
      });
      // when
      await visit('/eleves');
      await click('[aria-label="Afficher les actions"]');
      await click('.list-students-page__actions [role="button"]:last-child');
      await click('.dissociate-user-modal__actions button:last-child');

      // then
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
      assert.notContains('Dissocier le compte Pix de l\'élève');
      assert.contains(DASH_CHARACTER);
    });
  });
});
