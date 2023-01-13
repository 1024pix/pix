import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, fillByLabel, clickByName, within } from '@1024pix/ember-testing-library';
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

      await click(screen.getByRole('button', { name: 'Type' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement supérieur' }));

      await fillByLabel('Identifiant externe', 'nouvel identifiant externe');
      await fillByLabel('Prénom du DPO', 'Justin');
      await fillByLabel('Nom du DPO', 'Ptipeu');
      await fillByLabel('Adresse e-mail du DPO', 'justin.ptipeu@example.net');
      await clickByName('Espace surveillant');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert.dom(screen.getByRole('heading', { name: 'nouveau nom' })).exists();
      assert.dom(screen.getByText('Établissement supérieur')).exists();
      assert.dom(screen.getByText('nouvel identifiant externe')).exists();
      assert.dom(screen.getByText('Nom du : Justin Ptipeu')).exists();
      assert.dom(screen.getByText('Adresse e-mail du : justin.ptipeu@example.net')).exists();
      assert.strictEqual(screen.getAllByTitle('Délégué à la protection des données').length, 2);
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

  module('tab navigation', function () {
    test('should show Équipe and Invitations tab', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      // then
      const certificationCenterNavigation = within(
        screen.getByRole('navigation', {
          name: 'Navigation de la section centre de certification',
        })
      );
      assert.dom(certificationCenterNavigation.getByRole('link', { name: 'Équipe' })).exists();
      assert.dom(certificationCenterNavigation.getByRole('link', { name: 'Invitations' })).exists();
    });
  });
});
