import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Organizations | places', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('should display organization places', async function (assert) {
    // given
    const ownerOrganizationId = this.server.create('organization').id;
    this.server.create('organizationPlace', {
      count: 7777,
      reference: 'FFVII',
      category: 'SquareEnix',
      status: 'ACTIVE',
      activationDate: '1997-01-31',
      expiredDate: '2100-12-31',
      createdAt: '1996-01-12',
      creatorFullName: 'Hironobu Sakaguchi',
    });

    // when
    const screen = await visit(`/organizations/${ownerOrganizationId}/places`);

    // then
    assert.dom(screen.getByText('FFVII')).exists();
  });
});
