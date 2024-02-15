import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Organizations | Children', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('"Organisations filles" tab exists', async function (assert) {
    // given
    const organizationId = this.server.create('organization').id;

    // when
    const screen = await visit(`/organizations/${organizationId}/children`);

    // then
    assert.strictEqual(currentURL(), `/organizations/${organizationId}/children`);
    assert.dom(screen.getByRole('link', { name: 'Organisations filles' })).hasClass('active');
  });

  module('when there is no child organization', function () {
    test('displays a message', async function (assert) {
      // given
      const organizationId = this.server.create('organization').id;
      this.server.get(`/admin/organizations/${organizationId}/children`, () => ({ data: [] }));

      // when
      const screen = await visit(`/organizations/${organizationId}/children`);

      // then
      assert.dom(screen.getByText('Aucune organisation fille')).exists();
      assert.dom(screen.getByRole('heading', { name: 'Organisations filles', level: 2 })).exists();
    });
  });

  module('when there is at least one child organization', function () {
    test('displays a list of child organizations', async function (assert) {
      // given
      const parentOrganizationId = this.server.create('organization').id;

      // when
      const screen = await visit(`/organizations/${parentOrganizationId}/children`);

      // then
      assert.dom(screen.queryByText('Aucune organisation fille')).doesNotExist();
      assert.dom(screen.getByRole('table', { name: 'Liste des organisations filles' })).exists();
    });
  });
});
