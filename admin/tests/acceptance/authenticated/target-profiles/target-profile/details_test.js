import { click, currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
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
      assert.deepEqual(currentURL(), '/login');
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
      assert.deepEqual(currentURL(), '/target-profiles/1');
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
      const screen = await visitScreen('/target-profiles/1');

      // then
      assert.dom(screen.getByText('Competence 1')).exists();
      assert.dom(screen.getByText('Area 1')).exists();
      assert.dom(screen.getByText('Tube 1')).exists();
    });

    test('it should redirect to organization details on click', async function (assert) {
      // given
      server.create('organization', { id: 456 });
      server.create('target-profile', { id: 1, ownerOrganizationId: 456 });
      await visit('/target-profiles/1');

      // when
      await click('a[href="/organizations/456"]');

      // then
      assert.deepEqual(currentURL(), '/organizations/456/team');
    });

    test('it should display target profile organizations', async function (assert) {
      // given
      server.create('organization', { id: 1, name: 'Fantastix', type: 'PRO', externalId: '123' });
      server.create('target-profile', { id: 1, name: 'Profil Cible' });

      // when
      const screen = await visitScreen('/target-profiles/1/organizations');

      // then
      assert.dom(screen.getByText('Fantastix')).exists();
      assert.dom(screen.getByText('PRO')).exists();
      assert.dom(screen.getByText('123')).exists();
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
      const screen = await visitScreen('/target-profiles/1');
      await clickByName('Editer');

      // then
      assert.dom(screen.queryByLabelText('Editer')).doesNotExist();
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
      const screen = await visitScreen('/target-profiles/1');
      await clickByName('Marquer comme obsolète');

      await clickByName('Oui, marquer comme obsolète');

      // then
      assert.dom(screen.getByText('Obsolète : Oui')).exists();
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
      const screen = await visitScreen('/target-profiles/1');
      await clickByName('Marquer comme obsolète');

      await clickByName('Non, annuler');

      // then
      assert.dom(screen.getByText('Obsolète : Non')).exists();
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
      const screen = await visitScreen('/target-profiles/1');
      await clickByName('Editer');
      await fillByLabel('* Nom', 'Profil Cible Fantastix Edited');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix Edited' })).exists();
      assert.dom(screen.queryByLabelText('Enregistrer')).doesNotExist();
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
      const screen = await visitScreen('/target-profiles/1');
      await clickByName('Editer');
      await fillByLabel('Catégorie :', 'CUSTOM');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Parcours sur-mesure')).exists();
      assert.dom(screen.queryByLabelText('Enregistrer')).doesNotExist();
    });
  });
});
