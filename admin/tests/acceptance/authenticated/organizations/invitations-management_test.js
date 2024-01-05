import { module, test } from 'qunit';
import { fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Organizations | Invitations management', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('should allow to invite a member when user has access', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const organization = this.server.create('organization', {
      name: 'Aude Javel Company',
    });

    // when
    const screen = await visit(`/organizations/${organization.id}/invitations`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' }), 'user@example.com');
    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    assert.dom(screen.getByText('user@example.com')).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' })).hasNoValue();
  });

  test('should not allow to invite a member when user does not have access', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isCertif: true })(server);
    const organization = this.server.create('organization', {
      name: 'Aude Javel Company',
    });

    // when
    const screen = await visit(`/organizations/${organization.id}/invitations`);

    // then
    assert.dom(screen.queryByText('Inviter un membre')).doesNotExist();
  });

  module('when an admin member cancels an invitation', function () {
    test('it should display a success notification', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const organization = this.server.create('organization', {
        id: 5,
        name: 'Kabuki',
      });
      this.server.create('organization-invitation', {
        email: 'kabuki@example.net',
        lang: 'fr',
        organization,
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await click(screen.getByRole('button', { name: 'Annuler l’invitation de kabuki@example.net' }));

      // then
      assert.dom(screen.getByText('Cette invitation a bien été annulée.')).exists();
    });

    module('and an error occurs', function () {
      test('it should display an error notification and the invitation should remain in the list', async function (assert) {
        // given
        const dayjsService = this.owner.lookup('service:dayjs');
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const updatedAt = new Date('2023-12-05T09:00:00Z');

        const organization = this.server.create('organization', {
          id: 5,
          name: 'Kabuki',
        });
        const organizationInvitation = this.server.create('organization-invitation', {
          id: 10,
          email: 'kabuki@example.net',
          lang: 'fr',
          updatedAt,
          organization,
        });
        this.server.delete(
          `/admin/organizations/${organization.id}/invitations/${organizationInvitation.id}`,
          () => new Response({}),
          500,
        );

        // when
        const screen = await visit(`/organizations/${organization.id}/invitations`);
        await click(screen.getByRole('button', { name: 'Annuler l’invitation de kabuki@example.net' }));

        // then
        const formattedDate = dayjsService.self(updatedAt).format('DD/MM/YYYY [-] HH:mm');

        assert.dom(screen.getByText('Une erreur s’est produite, veuillez réessayer.')).exists();
        assert.dom(screen.getByRole('row', { name: 'Invitation en attente de kabuki@example.net' })).exists();
        assert.dom(screen.getByRole('cell', { name: 'kabuki@example.net' })).exists();
        assert.dom(screen.getByRole('cell', { name: formattedDate })).exists();
      });
    });
  });
});
