import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl, { t } from '../../../helpers/setup-intl';

module('Acceptance | Networks | Edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it edits the network name successfully', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const network = server.create('network', { name: 'Ancien nom' });
    const screen = await visit(`/networks/${network.id}`);

    // when
    await click(screen.getByRole('button', { name: t('common.actions.edit') }));
    await fillByLabel(`${t('components.networks.editing.name.label')} *`, 'Nouveau nom');
    await click(screen.getByRole('button', { name: t('common.actions.save') }));

    // then
    assert.ok(await screen.findByText(t('components.networks.editing.notifications.success')));
    assert.dom(screen.getByRole('heading', { name: 'Nouveau nom' })).exists();
  });
});
