import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Certification-centers | Invitations management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should allow to invite a member', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const certificationCenter = this.server.create('certification-center', {
      name: 'Aude Javel Company',
    });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}/invitations`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' }), 'user@example.com');
    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    assert.dom(screen.getByText('user@example.com')).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' })).hasNoValue();
  });

  test('should be possible to cancel a certification center invitation', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const certificationCenter = this.server.create('certification-center', {
      id: 123,
      name: 'My Hero Academia',
    });
    this.server.create('certification-center-invitation', {
      certificationCenterId: 123,
      email: 'bakugo@mha.com',
    });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}/invitations`);
    await clickByName('Annuler l’invitation de bakugo@mha.com');

    // then
    assert.dom(screen.queryByText('bakugo@mha.com')).doesNotExist();
    assert.dom(screen.getByText('Cette invitation a bien été annulée.'));
  });
});
