import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
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
          const screen = await visit('/complementary-certifications/1/attach-target-profile');
          const currentTargetProfileLinks = screen.getAllByRole('link', { name: 'ALEX TARGET' });

          // when
          await click(currentTargetProfileLinks[0]);

          // then
          assert.strictEqual(currentURL(), '/target-profiles/3/details');
        });
      });
    });
  },
);
