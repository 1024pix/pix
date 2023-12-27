import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../../../helpers/setup-intl';
import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { currentURL, click } from '@ember/test-helpers';

module('Acceptance | Autonomous courses | Autonomous course', function (hooks) {
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

    module('details page', function () {
      test('it should display details of the autonomous course', async function (assert) {
        // given
        server.create('autonomous-course', {
          id: 1,
          internalTitle: 'nom interne',
          publicTitle: 'nom public',
          customLandingPageText: "texte page d'accueil",
          code: 'CODE',
          createdAt: new Date('2020-01-01'),
        });

        // when
        const screen = await visit('/autonomous-courses/1');

        // then
        assert.strictEqual(currentURL(), '/autonomous-courses/1/details');
        assert.dom(screen.getAllByRole('heading', { name: 'nom interne', level: 1 })[0]).exists();
        assert.dom(screen.getByText('nom public')).exists();
        assert.dom(screen.getByText("texte page d'accueil")).exists();
        assert.dom(screen.getByText('01/01/2020')).exists();
        assert.dom(screen.getByRole('link', { name: 'Lien vers la campagne CODE (nouvelle fenêtre)' })).exists();
      });
    });

    module('list page', function () {
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
  });
});
