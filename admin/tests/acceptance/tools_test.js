import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | tools', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('Access', function () {
    test('Tools page should be accessible from /tools', async function (assert) {
      // given & when
      await visit('/tools');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/tools');
    });
  });

  module('Rendering', function () {
    test('Should content "Learning content" section', async function (assert) {
      // given & when
      await visit('/tools');

      // then
      assert.dom('section[data-test-id="learning-content"]').exists();
      assert.dom('button').exists();
    });
  });

  module('Refresh cache content', function () {
    test('it request the cache refresh', async function (assert) {
      // given
      const screen = await visitScreen('/tools');

      // when
      await clickByName('Recharger le cache');

      // then
      assert.dom(screen.getByText('La demande de rechargement du cache a bien été prise en compte.')).exists();
    });
  });

  module('Create release and refresh cache content', function () {
    test('it request the release creation and refresh cache', async function (assert) {
      // given
      const screen = await visitScreen('/tools');

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

  test('it should be possible to create a new tag', async function (assert) {
    // given
    const screen = await visitScreen('/tools');

    // when
    await fillByLabel('Nom du tag', 'Mon super tag');
    await clickByName('Créer le tag');

    // then
    assert.dom(screen.getByText('Le tag a bien été créé !')).exists();
    assert.dom('#tagNameInput').hasNoValue();
  });
});
