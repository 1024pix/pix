import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Credits', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  module('when creating a credits lot', function () {
    test('it adds the created credits lot to the table', async function (assert) {
      // given
      server.create('organization', {
        id: 1,
        name: 'My Organization With CREDITS_MANAGEMENT',
        features: { CREDITS_MANAGEMENT: { active: true }, PLACES_MANAGEMENT: { active: false } },
      });
      const screen = await visit(`/organizations/1/credits`);

      // when
      await click(screen.getByRole('button', { name: t('components.organizations.credits.creation.open-button') }));

      await screen.findByRole('dialog');

      await fillIn(
        screen.getByLabelText(t('components.organizations.credits.creation.labels.count'), { exact: false }),
        50,
      );
      await fillIn(
        screen.getByLabelText(t('components.organizations.credits.creation.labels.activation-date'), { exact: false }),
        '2026-01-01',
      );
      await fillIn(
        screen.getByLabelText(t('components.organizations.credits.creation.labels.expiration-date'), { exact: false }),
        '2026-12-31',
      );
      await fillIn(
        screen.getByLabelText(t('components.organizations.credits.creation.labels.reference'), { exact: false }),
        'REF1234',
      );
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      assert.dom(await screen.findByRole('cell', { name: 'REF1234' })).exists();
      assert.dom(screen.getByText(t('components.organizations.credits.creation.notifications.success'))).exists();
    });
  });
});
