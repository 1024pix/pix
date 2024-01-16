import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../../../helpers/setup-intl';
import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { currentURL, click } from '@ember/test-helpers';

module('Acceptance | Autonomous courses', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When admin member is logged in', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('autonomous-course-target-profile', {
        name: 'Profil cible de Guigui',
        category: 'category',
        organization: server.create('organization'),
      });
    });

    module('creation page', function () {
      test('it should set autonomous course menubar item active', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/new');

        // then
        assert.dom(screen.getByRole('link', { name: 'Parcours autonomes' })).hasClass('active');
      });

      test('it should create an autonomous course', async function (assert) {
        // given
        const screen = await visit('/autonomous-courses/new');

        // when
        await fillByLabel(/Nom interne/, 'Parcours de Guigui');

        const button = screen.getByLabelText(/Quel profil cible voulez-vous associer à ce parcours autonome ?/);
        await click(button);
        await click(await screen.findByRole('option', { name: 'Profil cible de Guigui' }));

        await fillByLabel(/Nom public/, 'Parcours professionalisant de Guillaume');
        const submitButton = screen.getByRole('button', { name: 'Créer le parcours autonome' });
        await click(submitButton);

        //then
        assert.strictEqual(currentURL(), '/autonomous-courses/1/details');
      });
    });

    module('list page', function () {
      test('it should set autonomous course menubar item active', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/list');

        // then
        assert.dom(screen.getByRole('link', { name: 'Parcours autonomes' })).hasClass('active');
      });

      test('it should display a list of autonomous-courses', async function (assert) {
        // given
        for (let index = 1; index < 6; index++) {
          server.create('autonomous-course', {
            id: index,
          });

          server.create('autonomous-course-list-item', {
            id: index,
            name: `Parcours autonome n°${index}`,
            createdAt: new Date(`2020-01-0${index}`),
            archiveAt: null,
          });
        }

        // when
        const screen = await visit('/autonomous-courses/list');

        await click(screen.getByRole('link', { name: 'Parcours autonome n°3' }));

        // then
        assert.strictEqual(currentURL(), '/autonomous-courses/3/details');
      });

      test('it should display a button to create a new autonomous course', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/list');

        await click(screen.getByRole('link', { name: 'Nouveau parcours autonome' }));

        // then
        assert.strictEqual(currentURL(), '/autonomous-courses/new');
      });
    });

    module('details page', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        server.create('autonomous-course', {
          id: 1,
          internalTitle: 'Parcours SUP SCO 2023',
          publicTitle: "Votre parcours scolaire de l'année 2023",
          customLandingPageText: 'Bienvenue dans votre parcours',
          code: 'CODE',
          createdAt: '2023-12-27T15:07:57.376Z',
        });
      });

      test('it should display details of the autonomous course', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/1');

        // then
        assert.strictEqual(currentURL(), '/autonomous-courses/1/details');
        assert.dom(screen.getAllByRole('heading', { name: 'Parcours SUP SCO 2023', level: 1 })[0]).exists();
        assert.dom(screen.getByText('Bienvenue dans votre parcours')).exists();

        assert.dom(screen.getByText('27/12/2023')).exists();
        assert.dom(screen.getByRole('link', { name: 'Lien vers la campagne CODE (nouvelle fenêtre)' })).exists();
      });

      test('it displays the update form when requested', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/1');

        const button = screen.getByText('Modifier');
        await click(button);

        // then
        assert.dom(screen.getByLabelText(/Nom interne/)).exists();
        assert.dom(screen.getByLabelText(/Nom public/)).exists();
        assert.dom(screen.getByLabelText(/Texte de la page d'accueil/)).exists();
        assert.dom(screen.getByText('Sauvegarder les modifications')).exists();
      });

      test('it reverts autonomous course data on cancel', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/1');

        const editButton = screen.getByText('Modifier');
        await click(editButton);

        await fillByLabel(/Nom interne/, 'Une erreur de frappe');

        const cancelButton = screen.getByText('Annuler');
        await click(cancelButton);

        assert.dom(screen.queryByText('Une erreur de frappe')).doesNotExist();
      });

      test('it should update the autonomous course', async function (assert) {
        // when
        const screen = await visit('/autonomous-courses/1');

        const button = screen.getByText('Modifier');
        await click(button);

        await fillByLabel(/Nom interne/, 'Parcours professionnalisant de Guillaume');
        await fillByLabel(/Nom public/, 'Parcours public');
        await fillByLabel(/Texte de la page d'accueil/, 'Bienvenue dans votre parcours');
        const submitButton = screen.getByRole('button', { name: 'Sauvegarder les modifications' });
        await click(submitButton);

        // then
        assert.strictEqual(screen.getAllByText('Parcours professionnalisant de Guillaume').length, 3);
        assert.dom(screen.getByText('Parcours public')).exists();
        assert.dom(screen.getByText('Bienvenue dans votre parcours')).exists();
      });
    });
  });
});
