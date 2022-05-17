import { module, test } from 'qunit';
import { fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit, clickByName } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Organizations | Invitations management', function (hooks) {
  setupApplicationTest(hooks);
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
    await clickByName('Inviter un membre');

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
});
