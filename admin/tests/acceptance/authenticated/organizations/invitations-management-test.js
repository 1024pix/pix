import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl, { t } from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Organizations | Invitations management', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks, 'fr');
  setupMirage(hooks);

  let intl;

  hooks.beforeEach(function () {
    intl = this.owner.lookup('service:intl');
  });

  module('inviting a member', function () {
    test('should allow to invite a member when user has access', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const organization = this.server.create('organization', {
        name: 'Aude Javel Company',
        features: { PLACES_MANAGEMENT: { active: true } },
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' }), 'user@example.com');
      await click(screen.getByRole('button', { name: 'Inviter un membre' }));

      // then
      const createdInvitation = await screen.findByRole('cell', { name: 'user@example.com' });
      await settled();

      assert.ok(createdInvitation);
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' })).hasNoValue();
      assert.ok(screen.getByRole('link', { name: `${t('pages.organization.navbar.invitations')} (1)` }));
      assert.ok(screen.getByText("Un email a bien a été envoyé à l'adresse user@example.com."));
    });

    test('should display an error if the creation has failed', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const organization = this.server.create('organization', {
        name: 'Orga name',
        features: { PLACES_MANAGEMENT: { active: true } },
      });

      this.server.post(
        '/admin/organizations/:id/invitations',
        () => ({ errors: [{ status: '500', title: 'An error occurred' }] }),
        500,
      );

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' }), 'user@example.com');
      await click(screen.getByRole('button', { name: 'Inviter un membre' }));

      // then
      const createdInvitation = screen.queryByRole('cell', { name: 'user@example.com' });
      await settled();

      assert.notOk(createdInvitation);
      assert.ok(screen.getByText('Une erreur s’est produite, veuillez réessayer.'));
    });

    test('should not allow to invite a member when user does not have access', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isCertif: true })(server);
      const organization = this.server.create('organization', {
        name: 'Aude Javel Company',
        features: { PLACES_MANAGEMENT: { active: true } },
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);

      // then
      assert.notOk(screen.queryByRole('button', { name: 'Inviter un membre' }));
    });
  });

  module('when an admin member cancels an invitation', function () {
    test('it should display a success notification', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const organization = this.server.create('organization', {
        id: 5,
        name: 'Kabuki',
        features: { PLACES_MANAGEMENT: { active: true } },
      });
      this.server.create('organization-invitation', {
        email: 'kabuki@example.net',
        locale: 'fr',
        organization,
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await click(screen.getByRole('button', { name: 'Annuler l’invitation de kabuki@example.net' }));

      // then
      assert.ok(screen.getByText('Cette invitation a bien été annulée.'));
    });

    module('and an error occurs', function () {
      test('it should display an error notification and the invitation should remain in the list', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const updatedAt = new Date('2023-12-05T09:00:00Z');

        const organization = this.server.create('organization', {
          id: 5,
          name: 'Kabuki',
          features: { PLACES_MANAGEMENT: { active: true } },
        });
        const organizationInvitation = this.server.create('organization-invitation', {
          id: 10,
          email: 'kabuki@example.net',
          locale: 'fr',
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
        assert.ok(screen.getByText('Une erreur s’est produite, veuillez réessayer.'));
        assert.ok(screen.getByRole('cell', { name: 'kabuki@example.net' }));
        assert.ok(screen.getByRole('cell', { name: intl.formatDate(updatedAt, { format: 'medium' }) }));
      });
    });
  });
});
