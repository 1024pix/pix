import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | administration', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  module('Access', function () {
    test('Administration page should be accessible from /tools', async function (assert) {
      // given & when
      await visit('/administration');

      // then
      assert.strictEqual(currentURL(), '/administration');
    });
  });

  module('Rendering', function () {
    test('Should display "Learning content" information', async function (assert) {
      // given & when
      const screen = await visit('/administration');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Référentiel' })).exists();
      assert
        .dom(
          screen.getByText(
            'Une version du référentiel de données pédagogique est créée quotidiennement (vers 4h00) et le référentiel ' +
              "utilisé par l'application est mis à jour (vers 6h00)."
          )
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
      const screen = await visit('/administration');

      // when
      await clickByName('Recharger le cache');

      // then
      assert.dom(screen.getByText('La demande de rechargement du cache a bien été prise en compte.')).exists();
    });
  });

  module('Create release and refresh cache content', function () {
    test('it request the release creation and refresh cache', async function (assert) {
      // given
      const screen = await visit('/administration');

      // when
      await clickByName('Créer une nouvelle version du référentiel et recharger le cache');

      // then
      assert
        .dom(
          screen.getByText(
            'La création de la version du référentiel et le rechargement du cache a bien été prise en compte.'
          )
        )
        .exists();
    });
  });
});
