import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | administration | common ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  module('Access', function () {
    test('Administration page should be accessible from /administration/common', async function (assert) {
      // given & when
      await visit('/administration');

      // then
      assert.strictEqual(currentURL(), '/administration/common');
    });

    test('it should set administration menubar item active', async function (assert) {
      // when
      const screen = await visit(`/administration`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Administration' })).hasClass('active');
    });
  });

  module('Rendering', function () {
    test('Should display "Learning content" information', async function (assert) {
      // given & when
      const screen = await visit('/administration/common');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Référentiel' })).exists();
      assert
        .dom(
          screen.getByText(
            'Une version du référentiel de données pédagogique est créée quotidiennement (vers 4h00) et le référentiel ' +
              "utilisé par l'application est mis à jour (vers 6h00).",
          ),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Recharger le cache' })).exists();
      assert
        .dom(screen.getByRole('button', { name: 'Créer une nouvelle version du référentiel et recharger le cache' }))
        .exists();
    });
  });

  module('Refresh cache content', function () {
    test('it request the cache refresh', async function (assert) {
      // given
      const screen = await visit('/administration/common');

      // when
      await clickByName('Recharger le cache');

      // then
      assert.dom(await screen.findByText('La demande de rechargement du cache a bien été prise en compte.')).exists();
    });
  });

  module('Create release and refresh cache content', function () {
    test('it request the release creation and refresh cache', async function (assert) {
      // given
      const screen = await visit('/administration/common');

      // when
      await clickByName('Créer une nouvelle version du référentiel et recharger le cache');

      // then
      assert
        .dom(
          await screen.findByText(
            'La création de la version du référentiel et le rechargement du cache a bien été prise en compte.',
          ),
        )
        .exists();
    });
  });

  test('it should be possible to create a new tag', async function (assert) {
    // given
    const screen = await visit('/administration/common');

    // when
    await fillByLabel('Nom du tag', 'Mon super tag');
    await clickByName('Créer le tag');

    // then
    assert.dom(screen.getByText('Le tag a bien été créé !')).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Nom du tag' })).hasNoValue();
  });

  test('should display a navigation with tabs', async function (assert) {
    // given
    // when
    const screen = await visit('/administration/common');

    // then
    assert.dom(screen.getByRole('navigation', { name: 'Navigation de la section administration' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Commun' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Certification' })).exists();
  });

  module('when certification tab is clicked', function () {
    test('should display certification sections', async function (assert) {
      // given
      const screen = await visit('/administration/common');

      // when
      await click(screen.getByRole('link', { name: 'Certification' }));

      // then
      assert
        .dom(screen.getByRole('heading', { name: 'Configuration des mailles pour le score global', level: 2 }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: 'Configuration des seuils par compétence', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Simulateur de scoring', level: 2 })).exists();
    });
  });

  module('certification tab', function () {
    module('scoring simulator', function () {
      module('when a capacity is given', function () {
        test('should display a score and competence levels list', async function (assert) {
          // given
          const screen = await visit('/administration/common');
          await click(screen.getByRole('link', { name: 'Certification' }));

          // when
          await fillIn(screen.getByLabelText('Capacité'), 1);
          await clickByName('Générer un profil');

          // then

          assert.ok(await screen.findByText('Score :'));
          assert.ok(await screen.findByText('768'));
          assert.ok(await screen.findByText('Capacité :'));
          assert.ok(await screen.findByText('1'));

          const table = screen.getByRole('table', { name: 'Niveau par compétence' });
          const rows = await within(table).findAllByRole('row');

          assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
          assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
          assert.dom(within(rows[1]).getByRole('rowheader', { name: '1.1' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();
        });
      });

      module('when a score is given', function () {
        test('should display a competence and competence levels list', async function (assert) {
          // given
          const screen = await visit('/administration/common');
          await click(screen.getByRole('link', { name: 'Certification' }));

          // when
          await fillIn(screen.getByLabelText('Score global en Pix'), 768);
          await clickByName('Générer un profil');

          // then
          assert.ok(await screen.findByText('Score :'));
          assert.ok(await screen.findByText('768'));
          assert.ok(await screen.findByText('Capacité :'));
          assert.ok(await screen.findByText('1'));

          const table = screen.getByRole('table', { name: 'Niveau par compétence' });
          const rows = await within(table).findAllByRole('row');

          assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
          assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
          assert.dom(within(rows[1]).getByRole('rowheader', { name: '1.1' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();
        });
      });
    });
  });
});
