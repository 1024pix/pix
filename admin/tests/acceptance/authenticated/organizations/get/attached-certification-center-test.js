import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Attached Certification Center', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  module('when user has role "SUPER_ADMIN"', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('clicking the ID cell redirects to the certification center page', async function (assert) {
      // given
      const certificationCenter = this.server.create('certification-center', { id: '100', name: 'Centre Pix Paris' });
      const organizationId = this.server.create('organization', {
        name: 'Orga avec CDC',
        features: { PLACES_MANAGEMENT: { active: false } },
      }).id;
      this.server.create('attached-certification-center', {
        id: certificationCenter.id,
        organizationId,
        name: certificationCenter.name,
        externalId: 'EXT-001',
      });

      const screen = await visit(`/organizations/${organizationId}/attached-certification-centers`);

      // when
      await click(screen.getByRole('link', { name: certificationCenter.id }));

      // then
      assert.strictEqual(currentURL(), `/certification-centers/${certificationCenter.id}`);
    });

    test('detaching a certification center shows a success notification', async function (assert) {
      // given
      const certificationCenter = this.server.create('certification-center', { id: '100', name: 'Centre Pix Paris' });
      const organizationId = this.server.create('organization', {
        name: 'Orga avec CDC',
        features: { PLACES_MANAGEMENT: { active: false } },
      }).id;
      this.server.create('attached-certification-center', {
        id: certificationCenter.id,
        organizationId,
        name: certificationCenter.name,
        externalId: 'EXT-001',
      });

      const screen = await visit(`/organizations/${organizationId}/attached-certification-centers`);

      // when
      await click(
        screen.getByRole('button', {
          name: t('components.organizations.attached-certification-center.actions.detach.button'),
        }),
      );
      await screen.findByRole('dialog');
      await click(screen.getByRole('button', { name: t('common.actions.confirm') }));

      // then
      assert
        .dom(screen.getByText(t('components.organizations.attached-certification-center.actions.detach.success')))
        .exists();
    });
  });
});
