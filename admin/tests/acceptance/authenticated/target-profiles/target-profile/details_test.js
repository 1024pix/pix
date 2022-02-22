import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import clickByLabel from 'pix-admin/tests/helpers/extended-ember-test-helpers/click-by-label';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Target Profiles | Target Profile | Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/target-profiles/1');
    });

    test('it should display target profile details', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
        description: 'Top profil cible.',
        comment: 'Commentaire Privé.',
        category: 'SUBJECT',
        isSimplifiedAccess: true,
      });

      // when
      const screen = await visitScreen('/target-profiles/1');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix' })).exists();
      assert.dom(screen.getByText('Thématiques')).exists();
      assert.dom(screen.getByText('ID : 1')).exists();
      assert.dom(screen.getByText('Public : Oui')).exists();
      assert.dom(screen.getByText('Obsolète : Non')).exists();
      assert.dom(screen.getByText('Parcours Accès Simplifié : Oui')).exists();
      assert.dom(screen.getByText('456')).exists();
      assert.dom(screen.getByText('Top profil cible.')).exists();
      assert.dom(screen.getByText('Commentaire Privé.')).exists();
    });

    test('it should display target profile skills', async function (assert) {
      // given
      const area = server.create('area', { id: 'area1', title: 'Area 1' });
      const competence = server.create('competence', { id: 'competence1', name: 'Competence 1', areaId: 'area1' });
      const tube = server.create('tube', { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' });
      const skill = server.create('skill', { id: 'skill1', name: '@web3', difficulty: 1, tubeId: 'tube1' });

      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible',
        areas: [area],
        competences: [competence],
        tubes: [tube],
        skills: [skill],
      });

      // when
      await visit('/target-profiles/1');

      // then
      assert.contains('Competence 1');
      assert.contains('Area 1');
      assert.contains('Tube 1');
    });

    test('it should redirect to organization details on click', async function (assert) {
      // given
      server.create('organization', { id: 456 });
      server.create('target-profile', { id: 1, ownerOrganizationId: 456 });
      await visit('/target-profiles/1');

      // when
      await click('a[href="/organizations/456"]');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/organizations/456/team');
    });

    test('it should display target profile organizations', async function (assert) {
      // given
      server.create('organization', { id: 1, name: 'Fantastix', type: 'PRO', externalId: '123' });
      server.create('target-profile', { id: 1, name: 'Profil Cible' });

      // when
      await visit('/target-profiles/1/organizations');

      // then
      assert.dom('[aria-label="Organisation"]').containsText('Fantastix');
      assert.dom('[aria-label="Organisation"]').containsText('PRO');
      assert.dom('[aria-label="Organisation"]').containsText('123');
    });

    test('it should switch to edition mode', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
      });

      // when
      await visit('/target-profiles/1');
      await clickByLabel('Editer');

      // then
      assert.dom('Editer').doesNotExist();
    });

    test('it should outdate target profile', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
      });

      // when
      await visit('/target-profiles/1');
      await clickByLabel('Marquer comme obsolète');

      await clickByLabel('Oui, marquer comme obsolète');

      // then
      assert.dom('section').containsText('Obsolète : Oui');
    });

    test('it should not outdate target profile', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
      });

      // when
      await visit('/target-profiles/1');
      await clickByLabel('Marquer comme obsolète');

      await clickByLabel('Non, annuler');

      // then
      assert.dom('section').containsText('Obsolète : Non');
    });

    test('it should edit target profile name', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
        category: 'OTHER',
      });

      // when
      await visit('/target-profiles/1');
      await click('button[type=button]');
      await fillIn('#targetProfileName', 'Profil Cible Fantastix Edited');
      await click('button[type=submit]');

      // then
      assert.contains('Profil Cible Fantastix Edited');
      assert.dom('Enregistrer').doesNotExist();
    });

    test('it should edit target profile category', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix',
        isPublic: true,
        outdated: false,
        ownerOrganizationId: 456,
        category: 'OTHER',
      });

      // when
      await visit('/target-profiles/1');
      await click('button[type=button]');
      await fillIn('#targetProfileCategory', 'CUSTOM');
      await click('button[type=submit]');

      // then
      assert.contains('Parcours sur-mesure');
      assert.dom('Enregistrer').doesNotExist();
    });
  });
});
