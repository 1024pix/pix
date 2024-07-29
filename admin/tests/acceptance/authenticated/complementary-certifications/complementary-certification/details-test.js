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
