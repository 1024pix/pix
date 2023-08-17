import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Complementary certifications | Complementary certification | details ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
    module('on information section', function () {
      test('it should display current target profile link and redirect to details page on click', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        server.create('complementary-certification', {
          id: 1,
          key: 'KEY',
          label: 'MARIANNE CERTIF',
          targetProfilesHistory: [{ name: 'ALEX TARGET', id: 3, attachedAt: dayjs('2023-10-10T10:50:00Z') }],
        });
        server.create('target-profile', {
          id: 3,
          name: 'ALEX TARGET',
        });
        const screen = await visit('/complementary-certifications/1/details');
        const currentTargetProfileLinks = screen.getAllByRole('link', { name: 'ALEX TARGET' });

        // when
        await click(currentTargetProfileLinks[0]);

        // then
        assert.strictEqual(currentURL(), '/target-profiles/3/details');
      });
    });

    module('on history section', function () {
      test('it should display target profiles links and redirect to details page on click', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        server.create('complementary-certification', {
          id: 1,
          key: 'KEY',
          label: 'MARIANNE CERTIF',
          targetProfilesHistory: [
            { name: 'ALEX TARGET', id: 3, attachedAt: dayjs('2023-10-10T10:50:00Z') },
            { name: 'JEREM TARGET', id: 2, attachedAt: dayjs('2020-10-10T10:50:00Z') },
          ],
        });
        server.create('target-profile', {
          id: 2,
          name: 'JEREM TARGET',
        });
        const screen = await visit('/complementary-certifications/1/details');

        // when
        await click(screen.getByRole('link', { name: 'JEREM TARGET' }));

        // then
        assert.strictEqual(currentURL(), '/target-profiles/2/details');
      });
    });
  });

  module('when admin member has role "CERTIF"', function () {
    test('it should not allow user to access complementary certification details', async function (assert) {
      // given
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
