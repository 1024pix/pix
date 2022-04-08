import { module, test } from 'qunit';
import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';
import sinon from 'sinon';

module('Acceptance | organization invitations management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const now = new Date('2019-01-01T05:06:07Z');

  hooks.beforeEach(function () {
    sinon.stub(Date, 'now').returns(now);
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('should display invitations tab', async function (assert) {
    // given
    const user = server.create('user');
    const organization = this.server.create('organization');
    await createAuthenticateSession({ userId: user.id });

    // when
    const screen = await visit(`/organizations/${organization.id}`);

    // then
    assert.dom(screen.getByText('Invitations')).exists();
  });

  module('inviting a member', function () {
    test('should create an organization-invitation', async function (assert) {
      // given
      const user = server.create('user');
      const organization = this.server.create('organization');
      await createAuthenticateSession({ userId: user.id });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await fillByLabel('Adresse e-mail du membre à inviter', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await clickByText('Inviter');

      // then
      assert.dom(screen.getByText("Un email a bien a été envoyé à l'adresse user@example.com.")).exists();
      assert.dom(screen.getByText(moment(now).format('DD/MM/YYYY [-] HH:mm'))).exists();
      assert.dom('#userEmailToInvite').hasNoValue();
    });

    test('should display an error if the creation has failed', async function (assert) {
      // given
      const user = server.create('user');
      const organization = this.server.create('organization');
      await createAuthenticateSession({ userId: user.id });

      this.server.post(
        '/admin/organizations/:id/invitations',
        () => new Response(500, {}, { errors: [{ status: '500' }] })
      );

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);
      await fillByLabel('Adresse e-mail du membre à inviter', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await clickByText('Inviter');

      // then
      assert.dom(screen.queryByText(moment(now).format('DD/MM/YYYY [-] HH:mm'))).doesNotExist();
      assert.dom(screen.getByText('Une erreur s’est produite, veuillez réessayer.')).exists();
    });
  });
});
