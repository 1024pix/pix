import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | tools', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isMetier: true })(server);
  });

  module('Access', function () {
    test('Tools page should be accessible from /tools', async function (assert) {
      // given & when
      await visit('/tools');

      // then
      assert.strictEqual(currentURL(), '/tools');
    });
  });

  test('it should be possible to create a new tag', async function (assert) {
    // given
    const screen = await visit('/tools');

    // when
    await fillByLabel('Nom du tag', 'Mon super tag');
    await clickByName('Créer le tag');

    // then
    assert.dom(screen.getByText('Le tag a bien été créé !')).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Nom du tag' })).hasNoValue();
  });
});
