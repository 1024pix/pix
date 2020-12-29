import { module, test } from 'qunit';
import { currentURL, click, visit, fillIn } from '@ember/test-helpers';
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

    test('it should display target profile skills', async function(assert) {
      // given
      const skill = server.create('skill', { id: 'rec1', name: '@web3' });
      server.create('target-profile', { id: 1, name: 'Profil Cible', skills: [skill] });

      // when
      await visit('/target-profiles/1');

      // then
      assert.dom('[aria-label="Acquis"]').containsText('rec1');
      assert.dom('[aria-label="Acquis"]').containsText('@web3');
    });

    test('it should redirect to organization details on click', async function(assert) {
      // given
      server.create('organization', { id: 456 });
      server.create('target-profile', { id: 1, organizationId: 456 });
      await visit('/target-profiles/1');

      // when
      await click('a[href="/organizations/456"]');

      // then
      assert.equal(currentURL(), '/organizations/456/members');
    });

    test('it should display target profile organizations', async function(assert) {
      // given
      const organization = server.create('organization', { id: 1, name: 'Fantastix', type: 'PRO', externalId: '123' });
      server.create('target-profile', { id: 1, name: 'Profil Cible', organizations: [organization] });

      // when
      await visit('/target-profiles/1/organizations');

      // then
      assert.dom('[aria-label="Organisation"]').containsText('Fantastix');
      assert.dom('[aria-label="Organisation"]').containsText('PRO');
      assert.dom('[aria-label="Organisation"]').containsText('123');
    });

    test('it should edit target profile name', async function(assert) {
      // given
      server.create('target-profile', { id: 1, name: 'Profil Cible Fantastix', isPublic: true, outdated: false, organizationId: 456 });

      // when
      await visit('/target-profiles/1');
      await click('[aria-label="Editer"]');
      await fillIn('#targetProfileName', 'Profil Cible Fantastix Edited');
      await click('[aria-label="Enregistrer"]');

      // then
      assert.contains('Profil Cible Fantastix Edited');
    });
  });
});
