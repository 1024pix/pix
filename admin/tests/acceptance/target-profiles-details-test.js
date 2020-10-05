import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Target Profile Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      await createAuthenticateSession({ userId: 1 });
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1');

      // then
      assert.equal(currentURL(), '/target-profiles/1');
    });

    test('it should display target profile details', async function(assert) {
      // given
      server.create('target-profile', { id: 1, name: 'Profil Cible Fantastix', isPublic: true, outdated: false, organizationId: 456 });

      // when
      await visit('/target-profiles/1');

      // then
      assert.contains('Profil Cible Fantastix');
      assert.dom('section').containsText('ID : 1');
      assert.dom('section').containsText('Public : Oui');
      assert.dom('section').containsText('Archivé : Non');
      assert.dom('section').containsText('Organisation de référence : 456');
    });
  });
});
