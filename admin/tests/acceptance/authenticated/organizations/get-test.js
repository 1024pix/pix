import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Organizations | Get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When user is not logged in', function () {
    test('organization details page should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/organizations/1');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is authenticated as Super Admin', function (hooks) {
    const ORGANIZATION_ID = 1;
    const ARCHIVED_ORGANIZATION_ID = 2;
    const ORGANIZATION_WITHOUT_PLACES_MANAGEMENT_ID = 3;
    const ORGANIZATION_IN_NETWORK_ID = 4;

    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('organization', {
        id: ORGANIZATION_ID,
        name: 'My Organization',
        features: { PLACES_MANAGEMENT: { active: true } },
      });
    });

    test('it should be accessible for an authenticated user and redirect to details tab', async function (assert) {
      // when
      await visit(`/organizations/${ORGANIZATION_ID}`);

      // then
      assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/details`);
    });

    module('When organization is archived', function () {
      test('it should display who archived it', async function (assert) {
        // given
        server.create('organization', {
          id: ARCHIVED_ORGANIZATION_ID,
          name: 'My Archived Organization',
          archivedAt: new Date('2026-01-01'),
          features: { PLACES_MANAGEMENT: { active: true } },
          archivistFullName: 'Rob Lochon',
        });
        // when
        const screen = await visit(`/organizations/${ARCHIVED_ORGANIZATION_ID}`);

        // then
        assert.dom(screen.getByText('Archivée le 01/01/2026 par Rob Lochon.')).exists();
      });
    });

    module('Navigation tabs', function () {
      module('Details tab', function () {
        module('When organization is active', function () {
          test('it should display details tab', async function (assert) {
            // when
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.ok(within(navigationTabs).getByRole('link', { name: t('pages.organization.navbar.details') }));
          });

          test('it should navigate to details page when clicking tab', async function (assert) {
            // given
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // when
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

            const teamTab = within(navigationTabs).getByRole('link', {
              name: t('pages.organization.navbar.details'),
            });
            await click(teamTab);

            // then
            assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/details`);
          });
        });

        module('When organization is archived', function () {
          test('it should not display teams tab', async function (assert) {
            // given
            server.create('organization', {
              id: ARCHIVED_ORGANIZATION_ID,
              name: 'My Archived Organization',
              archivedAt: new Date('2026-01-01'),
              features: { PLACES_MANAGEMENT: { active: true } },
            });

            // when
            const screen = await visit(`/organizations/${ARCHIVED_ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.notOk(within(navigationTabs).queryByRole('link', { name: t('pages.organization.navbar.team') }));
          });
        });
      });

      module('Team tab', function () {
        module('When organization is active', function () {
          test('it should display team tab with number of active members', async function (assert) {
            // given
            const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
            server.create('organization-membership', { user, organizationId: ORGANIZATION_ID });

            // when
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.ok(within(navigationTabs).getByRole('link', { name: `${t('pages.organization.navbar.team')} (1)` }));
          });

          test('it should navigate to team page when clicking tab', async function (assert) {
            // given
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // when
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

            const teamTab = within(navigationTabs).getByRole('link', {
              name: `${t('pages.organization.navbar.team')} (0)`,
            });
            await click(teamTab);

            // then
            assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/team`);
          });
        });

        module('When organization is archived', function () {
          test('it should not display team tab', async function (assert) {
            // given
            server.create('organization', {
              id: ARCHIVED_ORGANIZATION_ID,
              name: 'My Archived Organization',
              archivedAt: new Date('2026-01-01'),
              features: { PLACES_MANAGEMENT: { active: true } },
            });

            // when
            const screen = await visit(`/organizations/${ARCHIVED_ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.notOk(within(navigationTabs).queryByRole('link', { name: t('pages.organization.navbar.team') }));
          });
        });
      });

      module('Invitations tab', function () {
        test('it should display invitations tab', async function (assert) {
          // given
          server.create('organization-invitation', { email: 'toto@example.net', status: 'pending' });
          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(
            within(navigationTabs).getByRole('link', { name: `${t('pages.organization.navbar.invitations')} (0)` }),
          );
        });

        test('it should navigate to invitations page when clicking tab', async function (assert) {
          // given
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // when
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

          const invitationsTab = within(navigationTabs).getByRole('link', {
            name: `${t('pages.organization.navbar.invitations')} (0)`,
          });
          await click(invitationsTab);

          // then
          assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/invitations`);
        });

        module('When organization is archived', function () {
          test('it should not display invitations tab', async function (assert) {
            // given
            server.create('organization', {
              id: ARCHIVED_ORGANIZATION_ID,
              name: 'My Archived Organization',
              archivedAt: new Date('2026-01-01'),
              features: { PLACES_MANAGEMENT: { active: true } },
            });
            // when
            const screen = await visit(`/organizations/${ARCHIVED_ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.notOk(
              within(navigationTabs).queryByRole('link', { name: t('pages.organization.navbar.invitations') }),
            );
          });
        });
      });

      module('Target profiles tab', function () {
        test('it should display target-profiles tab, with number of target-profiles', async function (assert) {
          // given
          server.create('target-profile-summary', { id: 123, name: 'Mon super profil cible' });

          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(
            within(navigationTabs).getByRole('link', { name: `${t('pages.organization.navbar.target-profiles')} (1)` }),
          );
        });

        test('it should navigate to target profiles page when clicking tab', async function (assert) {
          // given
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // when
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

          const targetProfilesTab = within(navigationTabs).getByRole('link', {
            name: `${t('pages.organization.navbar.target-profiles')} (0)`,
          });
          await click(targetProfilesTab);

          // then
          assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/target-profiles`);
        });

        test('page title is set on target profiles page', async function (assert) {
          // given
          const orgId = ORGANIZATION_ID;
          server.create('target-profile-summary', { id: 999, name: 'dummy' });

          // when
          await visit(`/organizations/${orgId}/target-profiles`);

          const headScreen = within(document.head);
          assert.ok(headScreen.getByText(`Orga ${orgId} | Profils cibles`, { selector: 'title' }));
        });
      });

      module('Campaigns tab', function () {
        test('it should display campaigns tab', async function (assert) {
          // given
          server.create('campaign', { organizationId: ORGANIZATION_ID });
          server.create('campaign', { organizationId: ORGANIZATION_ID });

          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(
            within(navigationTabs).getByRole('link', { name: `${t('pages.organization.navbar.campaigns')} (2)` }),
          );
        });
      });

      module('Places tab', function () {
        module('when PLACES_MANAGEMENT feature is enabled', function () {
          test('it should display places tab', async function (assert) {
            // when
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.ok(within(navigationTabs).getByRole('link', { name: t('pages.organization.navbar.places') }));
          });

          test('it should navigate to places page when clicking tab', async function (assert) {
            // given
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // when
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

            const placesTab = within(navigationTabs).getByRole('link', {
              name: t('pages.organization.navbar.places'),
            });
            await click(placesTab);

            // then
            assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/places`);
          });
        });

        module('when PLACES_MANAGEMENT feature is disabled', function () {
          test('it should not display places tab', async function (assert) {
            // given
            server.create('organization', {
              id: ORGANIZATION_WITHOUT_PLACES_MANAGEMENT_ID,
              name: 'My Organization Without PLACES_MANAGEMENT',
              features: { PLACES_MANAGEMENT: { active: false } },
            });

            // when
            const screen = await visit(`/organizations/${ORGANIZATION_WITHOUT_PLACES_MANAGEMENT_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.notOk(within(navigationTabs).queryByRole('link', { name: t('pages.organization.navbar.places') }));
          });
        });
      });

      module('Tags tab', function () {
        test('it should display tags tab', async function (assert) {
          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(within(navigationTabs).getByRole('link', { name: t('pages.organization.navbar.tags') }));
        });

        test('it should navigate to tags page when clicking tab', async function (assert) {
          // given
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // when
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

          const tagsTab = within(navigationTabs).getByRole('link', {
            name: t('pages.organization.navbar.tags'),
          });
          await click(tagsTab);

          // then
          assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/all-tags`);
        });
      });

      module('Network tab', function () {
        module('when organization is part of a network', function (hooks) {
          hooks.beforeEach(() => {
            const network = server.create('network', { name: 'Réseau Pro' });

            server.create('organization', {
              id: ORGANIZATION_IN_NETWORK_ID,
              name: 'My Organization In Network',
              features: { PLACES_MANAGEMENT: { active: true } },
              network: network,
            });

            server.create('organization', {
              parentOrganizationId: ORGANIZATION_IN_NETWORK_ID,
              name: 'Child of My Organization In Network',
              features: { PLACES_MANAGEMENT: { active: false } },
            });
          });

          test('it should display Network tab, with number of sub-level organizations', async function (assert) {
            // when
            const screen = await visit(`/organizations/${ORGANIZATION_IN_NETWORK_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.ok(
              within(navigationTabs).getByRole('link', {
                name: t('pages.organization.navbar.network', { nbrOfChildren: 1 }),
              }),
            );
          });

          test('it should navigate to organization network page when clicking tab', async function (assert) {
            // given
            const screen = await visit(`/organizations/${ORGANIZATION_IN_NETWORK_ID}`);

            // when
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

            const networkTab = within(navigationTabs).getByRole('link', {
              name: t('pages.organization.navbar.network', { nbrOfChildren: 1 }),
            });
            await click(networkTab);

            // then
            assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_IN_NETWORK_ID}/network`);
          });
        });

        module('when organization is not part of a network', function () {
          test('it should not display Network tab', async function (assert) {
            // when
            const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

            // then
            const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
            assert.notOk(
              within(navigationTabs).queryByRole('link', {
                name: t('pages.organization.navbar.network', { nbrOfChildren: 0 }),
              }),
            );
          });
        });
      });

      module('Statistics tab', function () {
        test('it should display Statistics tab', async function (assert) {
          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(
            within(navigationTabs).getByRole('link', {
              name: t('pages.organization.navbar.statistics'),
            }),
          );
        });

        test('it should navigate to organization statistics page when clicking tab', async function (assert) {
          // given
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // when
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

          const statisticsTab = within(navigationTabs).getByRole('link', {
            name: t('pages.organization.navbar.statistics'),
          });
          await click(statisticsTab);

          // then
          assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/statistics`);
        });
      });

      module('Attached certification center tab', function () {
        test('it should display the attached certification center tab', async function (assert) {
          // when
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // then
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
          assert.ok(
            within(navigationTabs).getByRole('link', {
              name: t('pages.organization.navbar.attached-certification-center'),
            }),
          );
        });

        test('it should navigate to attached certification center page when clicking tab', async function (assert) {
          // given
          const screen = await visit(`/organizations/${ORGANIZATION_ID}`);

          // when
          const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });

          const tab = within(navigationTabs).getByRole('link', {
            name: t('pages.organization.navbar.attached-certification-center'),
          });
          await click(tab);

          // then
          assert.strictEqual(currentURL(), `/organizations/${ORGANIZATION_ID}/attached-certification-centers`);
        });
      });
    });
  });

  module('When user is authenticated as Certif Admin', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isCertif: true })(server);
      server.create('organization', {
        id: 1,
        name: 'My Organization',
        features: { PLACES_MANAGEMENT: { active: true } },
      });
    });

    test('it should not display tags tab', async function (assert) {
      // when
      const screen = await visit('/organizations/1');

      // then
      const navigationTabs = screen.getByRole('navigation', { name: t('pages.organization.navbar.aria-label') });
      assert.notOk(within(navigationTabs).queryByRole('link', { name: t('pages.organization.navbar.tags') }));
    });
  });
});
