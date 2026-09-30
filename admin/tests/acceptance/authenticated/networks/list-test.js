import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Networks | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/networks/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('when user is logged in', function () {
    module('when user has super admin role', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should redirect to network creation form on click "Nouveau réseau"', async function (assert) {
        // given
        const screen = await visit('/networks/list');

        // when
        const networkCreationLink = screen.getByRole('link', { name: t('pages.networks.list.new-button') });
        await click(networkCreationLink);

        // then
        assert.strictEqual(currentURL(), '/networks/new');
      });

      test('it should be accessible', async function (assert) {
        // when
        await visit('/networks/list');

        // then
        assert.strictEqual(currentURL(), '/networks/list');
      });

      test('it should display the networks list', async function (assert) {
        // given
        server.create('network', { id: 1, name: 'Réseau Alpha' });
        server.create('network', { id: 2, name: 'Réseau Beta' });

        // when
        const screen = await visit('/networks/list');

        // then
        const table = screen.getByRole('table', { name: t('components.networks.list.table.caption') });
        assert.dom(table).exists();
        assert.dom(screen.getByText('Réseau Alpha')).exists();
        assert.dom(screen.getByText('Réseau Beta')).exists();
      });

      test('it should filter networks by name when typing in the search field', async function (assert) {
        // given
        server.create('network', { id: 1, name: 'Réseau Bretagne' });
        server.create('network', { id: 2, name: 'Autre réseau' });

        const screen = await visit('/networks/list');

        // when
        await fillByLabel(t('components.networks.list.filters.name'), 'Bretagne');

        // then
        assert.dom(screen.getByText('Réseau Bretagne')).exists();
        assert.dom(screen.queryByText('Autre réseau')).doesNotExist();
      });

      test('it should reset the name filter when clicking the clear filters button', async function (assert) {
        // given
        server.create('network', { id: 1, name: 'Réseau Bretagne' });
        server.create('network', { id: 2, name: 'Autre réseau' });

        const screen = await visit('/networks/list');
        await fillByLabel(t('components.networks.list.filters.name'), 'Bretagne');

        // when
        await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

        // then
        assert.dom(screen.getByRole('textbox', { name: t('components.networks.list.filters.name') })).hasValue('');
      });

      test('it should redirect to network get page when clicking on the ID', async function (assert) {
        // given
        server.create('network', { id: 1, name: 'Réseau Alpha' });

        const screen = await visit('/networks/list');

        // when
        const networkIdLink = screen.getByRole('link', { name: 1 });
        await click(networkIdLink);

        // then
        assert.strictEqual(currentURL(), '/networks/1');
      });

      test('it should navigate to page 2 and display networks beyond the first page', async function (assert) {
        // given
        server.createList('network', 10);
        server.create('network', { name: 'Réseau page deux alpha' });
        server.create('network', { name: 'Réseau page deux beta' });

        const screen = await visit('/networks/list');
        assert.dom(screen.queryByText('Réseau page deux alpha')).doesNotExist();

        // when
        await click(screen.getByRole('button', { name: /Aller à la page suivante/ }));

        // then
        assert.dom(screen.getByText('Réseau page deux alpha')).exists();
        assert.dom(screen.getByText('Réseau page deux beta')).exists();
      });
    });

    module('when user has metier role', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isMetier: true })(server);
      });

      test('it can access the networks list', async function (assert) {
        // when
        await visit('/networks/list');

        // then
        assert.strictEqual(currentURL(), '/networks/list');
      });
    });

    module('when user has certif role', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
      });

      test('it can access the networks list', async function (assert) {
        // when
        await visit('/networks/list');

        // then
        assert.strictEqual(currentURL(), '/networks/list');
      });
    });

    module('when user has support role', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSupport: true })(server);
      });

      test('it can access the networks list', async function (assert) {
        // when
        await visit('/networks/list');

        // then
        assert.strictEqual(currentURL(), '/networks/list');
      });
    });
  });
});
