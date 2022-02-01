import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
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
      await visit('/tools');

      // when
      await clickByName('Recharger le cache');

      // then
      assert.contains('La demande de rechargement du cache a bien été prise en compte.');
    });
  });

  module('Create release and refresh cache content', function () {
    test('it request the release creation and refresh cache', async function (assert) {
      // given
      await visit('/tools');

      // when
      await clickByName('Créer une nouvelle version du référentiel et recharger le cache');

      // then
      assert.contains(
        'La création de la version du référentiel et le rechargement du cache a bien été prise en compte.'
      );
    });
  });

  test('it should be possible to create a new tag', async function (assert) {
    // given
    await visit('/tools');

    // when
    await fillByLabel('Nom du tag', 'Mon super tag');
    await clickByName('Créer le tag');

    // then
    assert.contains('Le tag a bien été créé !');
    assert.dom('#tagNameInput').hasNoValue();
  });
});
