import { module, test } from 'qunit';
import { triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from '../../../../helpers/setup-intl';

module('Acceptance | authenticated/certification-centers/get/team', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('should display Certification center memberships', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
    });
    const user1 = server.create('user', { firstName: 'Eric', lastName: 'Hochet' });
    server.create('certification-center-membership', {
      certificationCenter,
      role: 'MEMBER',
      user: user1,
    });
    const user2 = server.create('user', { firstName: 'Gilles', lastName: 'Parbal' });
    server.create('certification-center-membership', {
      certificationCenter,
      role: 'MEMBER',
      user: user2,
    });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByLabelText('Informations du membre Gilles Parbal')).exists();
    assert.dom(screen.getByRole('link', { name: user1.id })).exists();

    assert.dom(screen.getByLabelText('Informations du membre Eric Hochet')).exists();
    assert.dom(screen.getByRole('link', { name: user2.id })).exists();
  });

  test('should be possible to deactivate a certification center membership', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const user = server.create('user', { firstName: 'Lili' });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
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
    const screen = await visit(`/certification-centers/${certificationCenter.id}`);
    await clickByName('Désactiver');

    // then
    assert.dom(screen.queryByText('Lili')).doesNotExist();
  });

  module('To add certification center membership', function () {
    test('should display elements to add certification center membership', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Ajouter un membre' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Ajouter le membre' })).exists();
    });

    test('should disable button if email is empty or contains spaces', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const spacesEmail = ' ';
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', spacesEmail);
      const input = screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' });
      await triggerEvent(input, 'focusout');

      // then
      assert.dom(screen.getByRole('button', { name: 'Ajouter le membre' })).hasAttribute('disabled');
    });

    test('should display error message and disable button if email is invalid', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', 'an invalid email');
      const input = screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' });
      await triggerEvent(input, 'focusout');

      // then
      assert.dom(screen.getByText("L'adresse e-mail saisie n'est pas valide.")).exists();
      assert.dom(screen.getByRole('button', { name: 'Ajouter le membre' })).hasAttribute('disabled');
    });

    test('should enable button and not display error message if email is valid', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', 'test@example.net');
      const input = screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' });
      await triggerEvent(input, 'focusout');

      // then
      assert.dom(screen.getByRole('button', { name: 'Ajouter le membre' })).hasNoAttribute('disabled');
      assert.dom(screen.queryByText("L'adresse e-mail saisie n'est pas valide.")).doesNotExist();
    });

    test('should display new certification-center-membership', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const email = 'test@example.net';
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await fillByLabel('Adresse e-mail du nouveau membre', email);
      const input = screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' });
      await triggerEvent(input, 'focusout');

      // when
      await clickByName('Ajouter le membre');

      // then
      assert.dom(screen.getByLabelText('Informations du membre Jacques Use')).exists();
      assert.dom(screen.getByText('test@example.net')).exists();
    });
  });
});
