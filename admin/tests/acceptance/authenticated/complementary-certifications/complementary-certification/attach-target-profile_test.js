import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit, waitFor } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import dayjs from 'dayjs';

module(
  'Acceptance | Complementary certifications | Complementary certification | attach-target-profile',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      module('on information section', function () {
        [
          { role: 'isSuperAdmin', hasAccess: true },
          { role: 'isSupport', hasAccess: true },
          { role: 'isMetier', hasAccess: true },
        ].forEach(function ({ role, hasAccess }) {
          test('should display complementary certification and current target profile name', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ [role]: hasAccess })(server);
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
            const screen = await visit('/complementary-certifications/1/attach-target-profile/3');

            // then
            assert.dom(screen.getByRole('heading', { name: 'MARIANNE CERTIF' })).exists();
            assert.dom(screen.getByRole('link', { name: 'ALEX TARGET' })).exists();
          });
        });

        module('when user click on target profile link', function () {
          [
            { role: 'isSuperAdmin', hasAccess: true },
            { role: 'isSupport', hasAccess: true },
            { role: 'isMetier', hasAccess: true },
          ].forEach(function ({ role, hasAccess }) {
            test('it should redirect to target profile detail page', async function (assert) {
              // given
              await authenticateAdminMemberWithRole({ [role]: hasAccess })(server);
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
              const screen = await visit('/complementary-certifications/1/attach-target-profile/3');

              const currentTargetProfileLinks = screen.getAllByRole('link', { name: 'ALEX TARGET' });

              // when
              await click(currentTargetProfileLinks[0]);

              // then
              assert.strictEqual(currentURL(), '/target-profiles/3/details');
            });
          });
        });

        module('when user type in the search bar', function () {
          test('it should display the search results', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            server.create('complementary-certification', {
              id: 1,
              key: 'KEY',
              label: 'MARIANNE CERTIF',
              targetProfilesHistory: [{ name: 'ALEX TARGET', id: 3, attachedAt: dayjs('2023-10-10T10:50:00Z') }],
            });
            server.create('attachable-target-profile', {
              id: 3,
              name: 'ALEX TARGET',
            });
            const screen = await visit('/complementary-certifications/1/attach-target-profile/3');

            // when
            const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
            await fillIn(input, '3');

            // then
            await waitFor(async () => {
              await screen.findByRole('listbox');
              assert.dom(screen.getByRole('option', { name: '3 - ALEX TARGET' })).exists();
            });
          });
        });
      });
    });
    module('when admin member has role "CERTIF"', function () {
      test('it should not allow user to access complementary certification and target profile details', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
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
        await visit('/complementary-certifications/1/attach-target-profile/3');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  },
);
