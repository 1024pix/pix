import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Organizations | Create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    server.create('country', { code: '99100', name: 'France' });

    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should set organizations menubar item active', async function (assert) {
    // when
    const screen = await visit('/organizations/new');

    // then
    assert.dom(screen.getByRole('link', { name: t('components.layout.sidebar.organizations') })).hasClass('active');
  });

  module('when creating an organization without a parent organization', function () {
    test('it shows the creation form without parent organization name', async function (assert) {
      // when
      const screen = await visit('/organizations/new');

      // then
      assert.dom(screen.queryByText('Organisation mère', { exact: false })).doesNotExist();
      assert.dom(screen.getByText(t('pages.organizations.breadcrumb.new-organization-page'))).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.add') })).exists();
    });

    test('it redirects the user to organizations list when cancelling', async function (assert) {
      // given
      const screen = await visit('/organizations/new');

      // when
      const cancelButton = await screen.getByRole('button', { name: t('common.actions.cancel') });
      await click(cancelButton);

      // then
      assert.strictEqual(currentURL(), '/organizations/list');
    });
  });

  module('when creating an organization with a parent organization', function (hooks) {
    let parentOrganization;

    hooks.beforeEach(function () {
      const network = server.create('network', { name: 'My Network', id: '11' });
      parentOrganization = server.create('organization', {
        name: 'Wayne Enterprises',
        features: { PLACES_MANAGEMENT: { active: true } },
        network,
      });
    });

    test('it shows the creation form with parent organization name', async function (assert) {
      // when
      const screen = await visit(`/organizations/new?parentOrganizationId=${parentOrganization.id}`);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('components.organizations.creation.parent-organization-name', {
              parentOrganizationName: parentOrganization.name,
            }),
            level: 2,
          }),
        )
        .exists();
      assert.dom(screen.getByText(t('pages.organizations.breadcrumb.new-child-organization-page'))).exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('components.organizations.creation.actions.add-child-organization'),
          }),
        )
        .exists();
    });

    test('it redirects the user to parent organization page when cancelling', async function (assert) {
      // given
      const screen = await visit(`/organizations/new?parentOrganizationId=${parentOrganization.id}`);
      // when
      const cancelButton = await screen.getByRole('button', { name: t('common.actions.cancel') });
      await click(cancelButton);

      // then
      assert.strictEqual(currentURL(), `/organizations/${parentOrganization.id}/network`);
    });
  });

  module('when an organization is created', function () {
    test('it redirects the user on the organization details page on tags tab', async function (assert) {
      // given
      const screen = await visit('/organizations/new');
      await fillByLabel(`${t('components.organizations.creation.name.label')} *`, 'Stark Corp.');

      await click(screen.getByRole('button', { name: `${t('components.organizations.creation.type.label')} *` }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.administration-team.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByText('Équipe 2'));

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.organization-learner-type.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByText('Teacher'));

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.country.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByText('France (99100)'));

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.category.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByText('Catégorie 1'));

      await fillByLabel(`${t('components.organizations.creation.dpo.firstname')}DPO`, 'Justin');
      await fillByLabel(`${t('components.organizations.creation.dpo.lastname')}DPO`, 'Ptipeu');
      await fillByLabel(`${t('components.organizations.creation.dpo.email')}DPO`, 'justin.ptipeu@example.net');

      // when
      await clickByName(t('common.actions.add'));

      // then
      assert.strictEqual(currentURL(), '/organizations/1/all-tags');
    });

    test('it shows validation errors if form is not correctly filled', async function (assert) {
      // given
      const screen = await visit('/organizations/new');

      // when
      await clickByName(t('common.actions.add'));

      // then
      assert.dom(screen.getByText(t('components.organizations.creation.error-messages.error-toast'))).exists();
    });
  });
});
