import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Target profiles management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('should display organization target profiles', async function (assert) {
    // given
    const ownerOrganizationId = this.server.create('organization', {
      name: 'Orga name',
      features: { PLACES_MANAGEMENT: { active: true } },
    }).id;
    this.server.create('target-profile-summary', { internalName: 'Profil cible du ghetto' });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/target-profiles`);

    // then
    const table = screen.getByRole('table', {
      name: t('components.organizations.target-profiles-section.table.caption'),
    });
    assert.dom(within(table).getByRole('cell', { name: 'Profil cible du ghetto' })).exists();
  });

  test('should add a target profile to an organization', async function (assert) {
    // given
    const organization = this.server.create('organization', {
      name: 'Orga name',
      features: { PLACES_MANAGEMENT: { active: true } },
    });

    // when
    const screen = await visit(`/organizations/${organization.id}/target-profiles`);
    const input = screen.getByLabelText('ID du ou des profil(s) cible(s)');
    const parentInput = input.parentNode;

    await fillByLabel('ID du ou des profil(s) cible(s)', '66');
    await clickByName('Valider');

    // then
    const table = await screen.findByRole('table', {
      name: t('components.organizations.target-profiles-section.table.caption'),
    });
    assert.dom(within(table).getByRole('cell', { name: 'Profil 66' })).exists();
    assert.dom(await within(parentInput).findByDisplayValue('')).hasAria('label', 'ID du ou des profil(s) cible(s)');
  });

  test('should not display organization target profiles when user does not have access', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isCertif: true })(server);
    const ownerOrganizationId = this.server.create('organization', {
      name: 'Orga name',
      features: { PLACES_MANAGEMENT: { active: true } },
    }).id;
    this.server.create('target-profile-summary', { internalName: 'Profil cible du ghetto', ownerOrganizationId });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/target-profiles`);

    // then
    assert.dom(screen.queryByRole('link', { name: 'Tags' })).doesNotExist();
  });
});
