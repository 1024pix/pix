import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Organizations | places', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is authenticated as support', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSupport: true })(server);
    });

    test('should display current organization places capacity', async function (assert) {
      // given
      const ownerOrganizationId = this.server.create('organization').id;

      // when
      const screen = await visit(`/organizations/${ownerOrganizationId}/places`);

      // then
      assert.dom(screen.getByText('Nombre de places actives')).exists();
      assert.dom(screen.getByText('7777')).exists();
    });

    test('should display organization places', async function (assert) {
      // given
      const ownerOrganizationId = this.server.create('organization').id;
      this.server.create('organization-place', {
        count: 7777,
        reference: 'FFVII',
        category: 'SquareEnix',
        status: 'ACTIVE',
        activationDate: '1997-01-31',
        expirationDate: '2100-12-31',
        createdAt: '1996-01-12',
        creatorFullName: 'Hironobu Sakaguchi',
      });

      // when
      const screen = await visit(`/organizations/${ownerOrganizationId}/places`);

      // then
      assert.dom(screen.getByText('FFVII')).exists();
    });

    test('should not diplay add places lot button', async function (assert) {
      // given
      const ownerOrganizationId = this.server.create('organization').id;

      // when
      const screen = await visit(`/organizations/${ownerOrganizationId}/places`);

      // then
      assert.dom(screen.queryByText('Ajouter des places')).doesNotExist();
    });
  });

  module('When user is authenticated as super admin', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('should go to add places lot page', async function (assert) {
      // given
      const ownerOrganizationId = this.server.create('organization').id;

      const screen = await visit(`/organizations/${ownerOrganizationId}/places`);
      // when
      await click(screen.getByRole('link', { name: 'Ajouter des places' }));

      // then
      assert.strictEqual(currentURL(), `/organizations/${ownerOrganizationId}/places/new`);
    });
  });
});
