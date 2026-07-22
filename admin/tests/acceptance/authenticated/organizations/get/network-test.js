import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Network', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  module('when user has role "SUPER_ADMIN"', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    module('Layout', function () {
      test('displays page title', async function (assert) {
        // given
        const network = this.server.create('network', { name: 'My network' });
        const organizationId = this.server.create('organization', {
          name: 'Orga name',
          features: { PLACES_MANAGEMENT: { active: true } },
          network,
        }).id;

        // when
        const screen = await visit(`/organizations/${organizationId}/network`);

        // then
        assert.dom(screen.getByRole('heading', { name: t('pages.organization-network.title'), level: 2 })).exists();
        const headScreen = within(document.head);
        assert.ok(headScreen.getByText(`Orga ${organizationId} | Réseau`, { selector: 'title' }));
      });
    });

    module('when there is at least one child organization', function () {
      test('displays a list of child organizations', async function (assert) {
        // given
        const network = this.server.create('network', { name: 'My network' });

        const parentOrganizationId = this.server.create('organization', {
          id: 1,
          name: 'Orga name',
          features: { PLACES_MANAGEMENT: { active: true } },
          network,
        }).id;

        this.server.create('organization', {
          id: 2,
          parentOrganizationId: 1,
          name: 'Child',
          features: { PLACES_MANAGEMENT: { active: true } },
        });

        // when
        const screen = await visit(`/organizations/${parentOrganizationId}/network`);

        // then
        assert.dom(screen.queryByText(t('components.organization.network.empty-table'))).doesNotExist();
        assert
          .dom(screen.getByRole('table', { name: t('components.organizations.network.children-list.table-name') }))
          .exists();
        assert.dom(screen.getByRole('cell', { name: 'Child' })).exists();
      });
    });

    module('when attaching child organization', function () {
      test('attaches child organization to parent organization and displays success notification', async function (assert) {
        // given
        const network = this.server.create('network', { name: 'My network' });

        const parentOrganization = this.server.create('organization', {
          id: 1,
          name: 'Parent Organization Name',
          features: { PLACES_MANAGEMENT: { active: true } },
          network,
        });
        this.server.create('organization', {
          id: 2,
          name: 'Child Organization Name',
          features: { PLACES_MANAGEMENT: { active: true } },
        });
        const screen = await visit(`/organizations/${parentOrganization.id}/network`);

        await fillByLabel(
          `${t('components.organizations.network.attach-child-form.input-label')} ${t('components.organizations.network.attach-child-form.input-information')}`,
          '2',
        );

        // when
        await clickByName(t('common.actions.add'));

        // then
        assert.dom(await screen.findByRole('cell', { name: 'Child Organization Name' })).exists();
        assert
          .dom(
            screen.getByText(
              t('pages.organization-network.notifications.success.attach-child-organization', { count: 1 }),
            ),
          )
          .exists();
      });
    });

    module('when creating child organization from parent page', function () {
      test('it should redirect to New organization page, with parent id in query params', async function (assert) {
        // given
        const network = this.server.create('network', { name: 'Test Network' });
        const parentOrganization = this.server.create('organization', {
          id: 1,
          name: 'Parent Organization Name',
          features: { PLACES_MANAGEMENT: { active: true } },
          network,
        });
        const screen = await visit(`/organizations/${parentOrganization.id}/network`);

        // when
        await click(
          screen.getByRole('link', { name: t('components.organizations.network.create-child-organization-button') }),
        );

        const expectedQueryParams = `?parentOrganizationId=${parentOrganization.id}`;

        // then
        assert.strictEqual(currentURL(), `/organizations/new${expectedQueryParams}`);
      });
    });
  });

  module('when user has role "CERTIF"', function () {
    test('it should not display actions section', async function (assert) {
      await authenticateAdminMemberWithRole({ isCertif: true })(server);
      const parentOrganizationId = this.server.create('organization', {
        name: 'Parent Orga name',
        features: { PLACES_MANAGEMENT: { active: true } },
      }).id;
      this.server.create('organization', {
        name: 'Child Orga name',
        parentOrganizationId,
        features: { PLACES_MANAGEMENT: { active: true } },
      });

      // when
      const screen = await visit(`/organizations/${parentOrganizationId}/network`);

      // then
      assert.notOk(
        screen.queryByRole(('link', { name: t('components.organizations.network.create-child-organization-button') })),
      );
    });
  });
});
