import { module, test } from 'qunit';
import { visit, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Organizations | Target profiles management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ role: 'SUPER_ADMIN' })(server);
  });

  test('should display organization target profiles', async function (assert) {
    // given
    const ownerOrganizationId = this.server.create('organization').id;
    this.server.create('target-profile', { name: 'Profil cible du ghetto', ownerOrganizationId });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/target-profiles`);

    // then
    assert.dom(screen.getByLabelText('Profil cible')).includesText('Profil cible du ghetto');
  });

  test('should add a target profile to an organization', async function (assert) {
    // given
    const organization = this.server.create('organization');

    // when
    const screen = await visit(`/organizations/${organization.id}/target-profiles`);
    await fillByLabel('ID du ou des profil(s) cible(s)', '66');
    await clickByName('Valider');

    // then
    assert.dom(screen.getByLabelText('Profil cible')).includesText('66');
    assert.dom(screen.getByLabelText('ID du ou des profil(s) cible(s)')).hasNoValue();
  });
});
