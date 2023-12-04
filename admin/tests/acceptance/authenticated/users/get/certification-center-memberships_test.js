import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
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
    await clickByName('Désactiver le membre de centre de certification');

    // then
    assert.dom(screen.getByText('Le membre a correctement été désactivé.')).exists();
    assert.dom(screen.queryByText('Chainsaw Center')).doesNotExist();
  });

  module('when editing the user certification center membership role', function () {
    module('when certification center membership role is successfully updated', function () {
      test('it displays a success notification and the new role', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const user = server.create('user', { firstName: 'Roronoa', lastName: 'Zoro' });
        const certificationCenter = server.create('certification-center', {
          name: 'Mugiwara Center',
          externalId: 'ABCDEF',
          type: 'SCO',
        });
        server.create('certification-center-membership', {
          certificationCenter,
          role: 'MEMBER',
          user,
        });

        // when
        const screen = await visit(`/users/${user.id}/certification-center-memberships`);
        await clickByName('Modifier le rôle du membre de ce centre de certification');
        await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Administrateur' }));
        await clickByName('Enregistrer la modification du rôle');

        // then
        assert.dom(screen.getByText('Le rôle du membre a été modifié.')).exists();
        assert.dom(screen.getByRole('cell', { name: 'Administrateur' })).exists();
      });
    });

    module('when an error occurs during an update of certification center membership role', function () {
      test('it displays an error notification and the current role', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const user = server.create('user', { firstName: 'Gilles', lastName: 'Parbal' });
        const certificationCenter = server.create('certification-center', {
          name: 'Center 1',
          externalId: 'ABCDEF',
          type: 'SCO',
        });
        server.create('certification-center-membership', {
          certificationCenter,
          role: 'MEMBER',
          user,
        });

        // when
        const screen = await visit(`/users/${user.id}/certification-center-memberships`);
        await clickByName('Modifier le rôle du membre de ce centre de certification');
        await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Administrateur' }));
        await clickByName('Enregistrer la modification du rôle');

        // then
        assert.dom(screen.getByText("Une erreur est survenue, le rôle du membre n'a pas été modifié.")).exists();
        assert.dom(screen.getByRole('cell', { name: 'Membre' })).exists();
      });
    });
  });
});
