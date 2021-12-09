import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';

import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

async function createAuthenticatedSession() {
  const user = createUserManagingStudents('ADMIN');
  createPrescriberByUser(user);

  await authenticateSession(user.id);

  return user;
}

const DASH_CHARACTER = '\u2013';
module('Acceptance | Student List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;
  let organizationId;

  hooks.beforeEach(async function () {
    user = await createAuthenticatedSession();
  });

  module('when the student is dissociated from the user', function () {
    test('it does not display the action button', async function (assert) {
      organizationId = user.memberships.models.firstObject.organizationId;

      server.create('student', {
        organizationId,
        id: 1,
        firstName: 'Ellen Louise',
        lastName: 'Ripley',
        email: 'ellen@example.net',
        username: 'ellen.ripley1234',
        isAuthenticatedFromGAR: true,
      });
      // when
      await visit('/eleves');
      await clickByName('Afficher les actions');
      await clickByName('Dissocier le compte');
      await clickByName('Oui, dissocier le compte');

      // then
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
      assert.notContains("Dissocier le compte Pix de l'élève");
      assert.contains(DASH_CHARACTER);
    });
  });
});
