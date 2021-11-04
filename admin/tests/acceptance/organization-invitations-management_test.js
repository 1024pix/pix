import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { clickByText } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import moment from 'moment';

module('Acceptance | organization invitations management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should display invitations tab', async function (assert) {
    // given
    const user = server.create('user');
    const organization = this.server.create('organization');
    await createAuthenticateSession({ userId: user.id });

    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.contains('Invitations');
  });

  module('inviting a member', function () {
    test('should create an organization-invitation', async function (assert) {
      // given
      const user = server.create('user');
      const organization = this.server.create('organization');
      await createAuthenticateSession({ userId: user.id });
      const now = new Date();

      // when
      await visit(`/organizations/${organization.id}/invitations`);
      await fillInByLabel('Adresse e-mail du membre à inviter', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await clickByText('Inviter');

      // then
      assert.contains("Un email a bien a été envoyé à l'adresse user@example.com.");
      assert.contains(moment(now).format('DD/MM/YYYY [-] HH:mm'));
      assert.dom('#userEmailToInvite').hasNoValue();
    });

    test('should display an error if the creation has failed', async function (assert) {
      // given
      const user = server.create('user');
      const organization = this.server.create('organization');
      await createAuthenticateSession({ userId: user.id });
      const now = new Date();

      this.server.post(
        '/admin/organizations/:id/invitations',
        () => new Response(500, {}, { errors: [{ status: '500' }] })
      );

      // when
      await visit(`/organizations/${organization.id}/invitations`);
      await fillInByLabel('Adresse e-mail du membre à inviter', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await clickByText('Inviter');

      // then
      assert.notContains(moment(now).format('DD/MM/YYYY [-] HH:mm'));
      assert.contains('Une erreur s’est produite, veuillez réessayer.');
    });
  });
});
