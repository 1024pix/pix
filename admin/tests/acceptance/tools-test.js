import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

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

    test('it should set tools menubar item active', async function (assert) {
      // when
      const screen = await visit(`/tools`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Outils' })).hasClass('active');
    });
  });
});
