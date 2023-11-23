import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, clickByName } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from '../../../../helpers/setup-intl';

module('Acceptance | authenticated/users/get/certification-center-memberships', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it displays user’s certification centers', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    const certificationCenter1 = server.create('certification-center', {
      name: 'Konoha Center',
      externalId: 'ABCDEF',
      type: 'SCO',
    });
    const certificationCenter2 = server.create('certification-center', {
      name: 'Akatsuki Center',
      externalId: 'GHIJKL',
      type: 'SUP',
    });
    const certificationCenterMembership1 = this.server.create('certification-center-membership', {
      certificationCenter: certificationCenter1,
      role: 'MEMBER',
    });
    const certificationCenterMembership2 = this.server.create('certification-center-membership', {
      certificationCenter: certificationCenter2,
      role: 'ADMIN',
    });
    const user = this.server.create('user', {
      email: 'obito.uchiwa@ninja.net',
      certificationCenterMemberships: [certificationCenterMembership1, certificationCenterMembership2],
    });

    // when
    const screen = await visit(`/users/${user.id}/certification-center-memberships`);

    // then
    assert.dom(screen.getByText('Konoha Center')).exists();
    assert.dom(screen.getByText('Akatsuki Center')).exists();
  });

  test('it’s possible to deactivate a certification center membership', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    const user = server.create('user', { firstName: 'Denji' });
    const certificationCenter = server.create('certification-center', {
      name: 'Chainsaw Center',
      externalId: 'ABCDEF',
      type: 'SCO',
    });
    server.create('certification-center-membership', {
      createdAt: new Date('2018-02-15T05:06:07Z'),
      certificationCenter,
      user,
      role: 'MEMBER',
    });

    // when
    const screen = await visit(`/users/${user.id}/certification-center-memberships`);
    await screen.getByText(certificationCenter.name);
    await clickByName('Désactiver');

    // then
    assert.dom(screen.getByText('Le membre a correctement été désactivé.')).exists();
    assert.dom(screen.queryByText('Chainsaw Center')).doesNotExist();
  });
});
