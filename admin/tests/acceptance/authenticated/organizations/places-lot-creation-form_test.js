import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Organizations | places lot creation form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should go to places listing page', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const ownerOrganizationId = this.server.create('organization').id;

    const screen = await visit(`/organizations/${ownerOrganizationId}/places/new`);

    // when
    await click(screen.getByRole('link', { name: 'Annuler' }));

    // then
    assert.strictEqual(currentURL(), `/organizations/${ownerOrganizationId}/places`);
  });
});
