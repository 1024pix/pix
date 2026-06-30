import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Attached Organizations Page', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  module('when user has role "SUPER_ADMIN"', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('clicking the ID cell redirects to the attached organization details page', async function (assert) {
      // given
      const organizationToAttach = this.server.create('organization', {
        id: '56',
        name: 'Organization to attach',
        externalId: 'EXT456',
        features: { PLACES_MANAGEMENT: { active: false } },
      });
      const certificationCenterId = this.server.create('certification-center', {
        name: 'Certification Center with attached organization',
      }).id;

      this.server.create('attached-organization', {
        id: organizationToAttach.id,
        certificationCenterId,
        name: organizationToAttach.name,
        externalId: organizationToAttach.externalId,
      });

      const screen = await visit(`/certification-centers/${certificationCenterId}/attached-organizations`);

      // when
      await click(screen.getByRole('link', { name: organizationToAttach.id }));

      // then
      assert.strictEqual(currentURL(), `/organizations/${organizationToAttach.id}/details`);
    });
  });
});
