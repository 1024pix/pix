import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

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
      const parentOrganizationId = this.server.create('organization', { id: 1 }).id;
      this.server.create('organization', { id: 2, parentOrganizationId: 1, name: 'Child' });

      // when
      const screen = await visit(`/organizations/${parentOrganizationId}/children`);

      // then
      assert.dom(screen.queryByText('Aucune organisation fille')).doesNotExist();
      assert.dom(screen.getByRole('table', { name: 'Liste des organisations filles' })).exists();
    });
  });

  module('when user has role "SUPER_ADMIN"', function () {
    test('displays attach child organization form', async function (assert) {
      // given
      const parentOrganizationId = this.server.create('organization').id;

      // when
      const screen = await visit(`/organizations/${parentOrganizationId}/children`);

      // then
      assert.dom(screen.getByRole('form', { name: `Formulaire d'ajout d'une organisation fille` })).exists();
    });

    module('when attaching child organization', function () {
      test('attaches child organization to parent organization and displays success notification', async function (assert) {
        // given
        const parentOrganization = this.server.create('organization', { id: 1, name: 'Parent Organization Name' });
        this.server.create('organization', { id: 2, name: 'Child Organization Name' });
        const screen = await visit(`/organizations/${parentOrganization.id}/children`);
        await fillByLabel(`Ajouter une organisation fille ID de l'organisation à ajouter`, '2');

        // when
        await clickByName('Ajouter');

        // then
        assert.dom(await screen.findByRole('cell', { name: 'Child Organization Name' })).exists();
        assert.dom(screen.getByText(`L'organisation fille a bien été liée à l'organisation mère`)).exists();
      });
    });
  });

  [
    { name: 'CERTIF', authData: { isCertif: true } },
    { name: 'METIER', authData: { isMetier: true } },
    { name: 'SUPPORT', authData: { isSupport: true } },
  ].forEach((role) => {
    module(`when user has role "${role.name}"`, function () {
      test('hides attach child organization form', async function (assert) {
        // given
        await authenticateAdminMemberWithRole(role.authData)(server);
        const parentOrganizationId = this.server.create('organization').id;

        // when
        const screen = await visit(`/organizations/${parentOrganizationId}/children`);

        // then
        assert.dom(screen.queryByRole('form', { name: `Formulaire d'ajout d'une organisation fille` })).doesNotExist();
      });
    });
  });
});
