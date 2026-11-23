import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl, { t } from '../../../helpers/setup-intl';

module('Acceptance | Networks | Create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user does not have super admin role', function () {
    test('user cannot access the network creation page', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);

      // when
      await visit('/networks/new');

      // then
      assert.strictEqual(currentURL(), '/organizations/list');
    });
  });

  module('when user has super admin role', function (hooks) {
    hooks.beforeEach(async function () {
      server.create('country', { code: '99100', name: 'France' });

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it shows the creation form', async function (assert) {
      // when
      const screen = await visit('/networks/new');

      // then
      assert.dom(screen.getByLabelText(`${t('components.networks.creation.name.label')} *`)).exists();
      assert.dom(screen.getByText(t('pages.networks.title'))).exists();
      assert.dom(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') })).exists();
    });

    module('when creating an network', function () {
      test('it creates a new network', async function (assert) {
        // given
        const screen = await visit('/networks/new');

        // when
        await fillByLabel(`${t('components.networks.creation.name.label')} *`, 'Nouveau réseau');
        await fillByLabel(`${t('components.networks.creation.organization-id.label')} *`, '1');
        await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

        // then
        assert.ok(await screen.findByText(t('components.networks.creation.notifications.success')));
      });

      test('it redirects to created network details page', async function (assert) {
        // given
        const screen = await visit('/networks/new');

        // when
        await fillByLabel(`${t('components.networks.creation.name.label')} *`, 'Nouveau réseau');
        await fillByLabel(`${t('components.networks.creation.organization-id.label')} *`, '1');
        await click(screen.getByRole('button', { name: t('components.networks.creation.actions.submit') }));

        // then
        assert.strictEqual(currentURL(), '/networks/10');
      });
    });
  });
});
