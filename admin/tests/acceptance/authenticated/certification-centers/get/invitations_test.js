import { module, test } from 'qunit';
import { fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

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
});
