import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Target profiles management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('should display organization target profiles', async function (assert) {
    // given
    const ownerOrganizationId = this.server.create('organization').id;
    this.server.create('target-profile-summary', { name: 'Profil cible du ghetto' });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/target-profiles`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Tags' })).exists();
    assert.dom(screen.getByLabelText('Profil cible')).includesText('Profil cible du ghetto');
  });

  test('should add a target profile to an organization', async function (assert) {
    // given
    const organization = this.server.create('organization');

    // when
    const screen = await visit(`/organizations/${organization.id}/target-profiles`);
    const input = screen.getByLabelText('ID du ou des profil(s) cible(s)');
    const parentInput = input.parentNode;

    await fillByLabel('ID du ou des profil(s) cible(s)', '66');
    await clickByName('Valider');
    // then
    assert.dom(await screen.findByLabelText('Profil cible')).includesText('66');
    assert.dom(await within(parentInput).findByDisplayValue('')).hasAria('label', 'ID du ou des profil(s) cible(s)');
  });

  test('should not display organization target profiles when user does not have access', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isCertif: true })(server);
    const ownerOrganizationId = this.server.create('organization').id;
    this.server.create('target-profile-summary', { name: 'Profil cible du ghetto', ownerOrganizationId });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/target-profiles`);

    // then
    assert.dom(screen.queryByRole('link', { name: 'Tags' })).doesNotExist();
  });
});
