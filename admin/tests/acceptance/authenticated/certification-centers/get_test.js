import { module, test } from 'qunit';
import { currentURL, triggerEvent, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | authenticated/certification-centers/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should access Certification center page by URL /certification-centers/:id', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
    });

    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.strictEqual(currentURL(), '/certification-centers/1');
  });

  test('should display Certification center detail', async function (assert) {
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
    assert.dom(screen.getByRole('heading', { name: 'Center 1' })).exists();
    assert.dom(screen.getByText('ABCDEF')).exists();
    assert.dom(screen.getByText('Établissement scolaire')).exists();
  });

  test('should display Certification center habilitations', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const habilitation1 = server.create('habilitation', { key: 'E', label: 'Pix+Edu' });
    const habilitation2 = server.create('habilitation', { key: 'S', label: 'Pix+Surf' });

    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
      habilitations: [habilitation1, habilitation2],
    });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByText('Pix+Edu')).exists();
    assert.dom(screen.getByText('Pix+Surf')).exists();
  });

  test('should highlight the habilitations of the current certification center', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const habilitation1 = server.create('habilitation', { key: 'E', label: 'Pix+Edu' });
    const habilitation2 = server.create('habilitation', { key: 'S', label: 'Pix+Surf' });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
      habilitations: [habilitation1, habilitation2],
    });

    server.create('habilitation', { key: 'S', label: 'Pix+Autre' });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByLabelText('Habilité pour Pix+Edu')).exists();
    assert.dom(screen.getByLabelText('Habilité pour Pix+Surf')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Pix+Autre')).exists();
  });

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
      user: user1,
    });
    const user2 = server.create('user', { firstName: 'Gilles', lastName: 'Parbal' });
    server.create('certification-center-membership', {
      certificationCenter,
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

  test('should be possible to desactive a certification center membership', async function (assert) {
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

  module('Update certification center', function () {
    test('should display a form after clicking on "Editer"', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await clickByName('Editer les informations');

      // then
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
    });

    test('should send edited certification center to the API', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
        isSupervisorAccessEnabled: false,
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer les informations');
      this.server.patch(`/admin/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

      // when
      await fillByLabel('Nom du centre', 'nouveau nom');
      await fillByLabel('Type', 'SUP');
      await fillByLabel('Identifiant externe', 'nouvel identifiant externe');
      await clickByName('Espace surveillant');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert.dom(screen.getByRole('heading', { name: 'nouveau nom' })).exists();
      assert.dom(screen.getByText('Établissement supérieur')).exists();
      assert.dom(screen.getByText('nouvel identifiant externe')).exists();
      assert.dom(screen.getByLabelText('Espace surveillant')).hasText('oui');
    });

    test('should display a success notification when the certification has been successfully updated', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      server.create('habilitation', { key: 'S', label: 'Pix+Surf' });
      server.create('habilitation', { key: 'A', label: 'Pix+Autre' });

      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer les informations');
      this.server.patch(`/admin/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

      // when
      await fillByLabel('Nom du centre', 'Centre des réussites');
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByLabelText('Habilité pour Pix+Surf')).exists();
      assert.dom(screen.getByLabelText('Non-habilité pour Pix+Autre')).exists();
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert.dom(screen.getByRole('heading', { name: 'Centre des réussites' })).exists();
      assert.dom(screen.getByText('Centre de certification mis à jour avec succès.')).exists();
    });

    test('should display an error notification when the certification has not been updated in API', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      this.server.patch(`/admin/certification-centers/${certificationCenter.id}`, () => new Response({}), 422);
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer les informations');

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert
        .dom(screen.getByText("Une erreur est survenue, le centre de certification n'a pas été mis à jour."))
        .exists();
    });
  });
});
