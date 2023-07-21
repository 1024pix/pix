import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Complementary certifications | Complementary certification | details ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    server.create('feature-toggle', { isTargetProfileVersioningEnabled: true });
  });

  module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
    test('it should redirect to target profile details on link click', async function (assert) {
      // given
      server.create('feature-toggle', { isTargetProfileVersioningEnabled: true });
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('complementary-certification', {
        id: 1,
        key: 'KEY',
        label: 'MARIANNE CERTIF',
        currentTargetProfile: { name: 'ALEX TARGET', id: 3 },
      });
      server.create('target-profile', {
        id: 3,
        name: 'ALEX TARGET',
      });
      const screen = await visit('/complementary-certifications/1/details');

      // when
      await click(screen.getByRole('link', { name: 'ALEX TARGET' }));

      // then
      assert.strictEqual(currentURL(), '/target-profiles/3/details');
    });
  });

  module('when admin member has role "CERTIF"', function () {
    test('it should not allow user to access complementary certification details', async function (assert) {
      // given
      server.create('feature-toggle', { isTargetProfileVersioningEnabled: true });
      await authenticateAdminMemberWithRole({ isCertif: true })(server);
      server.create('complementary-certification', {
        id: 1,
        key: 'KEY',
        label: 'MARIANNE CERTIF',
        currentTargetProfile: { name: 'ALEX TARGET', id: 3 },
      });

      // when
      await visit('/complementary-certifications/1/details');

      // then
      assert.strictEqual(currentURL(), '/organizations/list');
    });
  });
});
