import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

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

    // TODO : h1 en double, fix quand on mettra les templates dans les components
    // assert.dom(screen.getByRole('heading', { name: 'Center 1', level: 1 })).exists();
    assert.dom(screen.getByText('ABCDEF')).exists();
    assert.dom(screen.getByText('Établissement scolaire')).exists();
  });

  test('should display Certification center habilitations', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const habilitation1 = server.create('complementary-certification', { key: 'E', label: 'Pix+Edu' });
    const habilitation2 = server.create('complementary-certification', { key: 'S', label: 'Pix+Surf' });

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
    const habilitation1 = server.create('complementary-certification', { key: 'E', label: 'Pix+Edu' });
    const habilitation2 = server.create('complementary-certification', { key: 'S', label: 'Pix+Surf' });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
      habilitations: [habilitation1, habilitation2],
    });

    server.create('complementary-certification', { key: 'S', label: 'Pix+Autre' });

    // when
    const screen = await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByLabelText('Habilité pour Pix+Edu')).exists();
    assert.dom(screen.getByLabelText('Habilité pour Pix+Surf')).exists();
    assert.dom(screen.getByLabelText('Non habilité pour Pix+Autre')).exists();
  });

  module('Update certification center', function () {
    test('should display a form after clicking on "Modifier"', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await clickByName('Modifier');

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
      });
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Modifier');

      // when
      await fillByLabel('Nom du centre', 'nouveau nom', { exact: false });

      await click(screen.getByRole('button', { name: 'Type' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement supérieur' }));

      await fillByLabel('Identifiant externe', 'nouvel identifiant externe');
      await fillByLabel('Prénom du DPO', 'Justin');
      await fillByLabel('Nom du DPO', 'Ptipeu');
      await fillByLabel('Adresse e-mail du DPO', 'justin.ptipeu@example.net');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert.dom(screen.getByRole('heading', { name: 'nouveau nom', level: 1 })).exists();
      assert.dom(screen.getByText('Établissement supérieur')).exists();
      assert.dom(screen.getByText('nouvel identifiant externe')).exists();
      assert.dom(screen.getByText('Justin Ptipeu')).exists();
      assert.dom(screen.getByText('justin.ptipeu@example.net')).exists();
      assert.strictEqual(screen.getAllByTitle('Délégué à la protection des données').length, 2);
    });

    test('should display a success notification when the certification has been successfully updated', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      server.create('complementary-certification', { key: 'S', label: 'Pix+Surf' });
      server.create('complementary-certification', { key: 'A', label: 'Pix+Autre' });

      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Modifier');

      // when
      await fillByLabel('Nom du centre', 'Centre des réussites', { exact: false });
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByLabelText('Habilité pour Pix+Surf')).exists();
      assert.dom(screen.getByLabelText('Non habilité pour Pix+Autre')).exists();
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      // TODO : h1 en double, fix quand on mettra les templates dans les components
      // assert.dom(screen.getByRole('heading', { name: 'Centre des réussites', level: 1 })).exists();
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
      this.server.patch(`/admin/certification-centers/${certificationCenter.id}`, () => new Response(422));
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Modifier');

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByText('Habilitations aux certifications complémentaires')).exists();
      assert
        .dom(screen.getByText("Une erreur est survenue, le centre de certification n'a pas été mis à jour."))
        .exists();
    });
  });

  module('when certification center is not archived', function () {
    test('displays the "Archive" button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
        archivedAt: null,
        archivistFullName: null,
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Archiver' })).exists();
    });

    module('when the "Archive" button is clicked', function () {
      test('displays the confirmation modal', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationCenter = server.create('certification-center', {
          name: 'Pokemon Center',
          externalId: 'ABCDEF',
          type: 'PRO',
          archivedAt: null,
          archivistFullName: null,
        });

        // when
        const screen = await visit(`/certification-centers/${certificationCenter.id}`);
        await click(screen.getByRole('button', { name: 'Archiver' }));

        // then
        assert.dom(screen.getByText('Archiver le centre de certification Pokemon Center')).exists();
      });
    });

    module('when the archive confirmation button is clicked', function () {
      test('displays archived certification center banner', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationCenter = server.create('certification-center', {
          name: 'Pokemon Center',
          externalId: 'ABCDEF',
          type: 'PRO',
          archivedAt: null,
          archivistFullName: null,
        });

        // when
        const screen = await visit(`/certification-centers/${certificationCenter.id}`);
        await click(screen.getByRole('button', { name: 'Archiver' }));
        await click(screen.getByRole('button', { name: 'Confirmer' }));

        // then
        assert.dom(await screen.findByText('Archivé le 01/01/2025 par John Doe.')).exists();
      });
    });

    module('tab navigation', function () {
      test('should show Équipe, Invitations tab and Attached Orga tabs', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationCenter = server.create('certification-center', {
          name: 'Pokemon Center',
          externalId: 'ABCDEF',
          type: 'PRO',
          archivedAt: null,
          archivistFullName: null,
        });

        // when
        const screen = await visit(`/certification-centers/${certificationCenter.id}`);

        // then
        const certificationCenterNavigation = within(
          screen.getByRole('navigation', {
            name: t('pages.certification-centers.get.navbar.aria-label'),
          }),
        );
        assert
          .dom(
            certificationCenterNavigation.getByRole('link', {
              name: (text) => text.includes(t('pages.certification-centers.get.navbar.team')),
            }),
          )
          .exists();
        assert
          .dom(
            certificationCenterNavigation.getByRole('link', {
              name: (text) => text.includes(t('pages.certification-centers.get.navbar.invitations')),
            }),
          )
          .exists();
        assert
          .dom(
            certificationCenterNavigation.getByRole('link', {
              name: t('pages.certification-centers.get.navbar.attached-organizations'),
            }),
          )
          .exists();
      });

      test('should display the number of active members in the Équipe tab', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationCenter = server.create('certification-center', {
          name: 'Pokemon Center',
          externalId: 'ABCDEF',
          type: 'PRO',
          archivedAt: null,
          archivistFullName: null,
        });
        const user1 = server.create('user');
        const user2 = server.create('user');
        server.create('certification-center-membership', { certificationCenter, role: 'MEMBER', user: user1 });
        server.create('certification-center-membership', { certificationCenter, role: 'ADMIN', user: user2 });

        // when
        const screen = await visit(`/certification-centers/${certificationCenter.id}`);

        // then
        const certificationCenterNavigation = within(
          screen.getByRole('navigation', {
            name: 'Navigation de la section centre de certification',
          }),
        );
        assert.dom(certificationCenterNavigation.getByRole('link', { name: 'Équipe (2)' })).exists();
      });

      test('displays invitation input and members list', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationCenter = server.create('certification-center', {
          name: 'Pokemon Center',
          externalId: 'ABCDEF',
          type: 'PRO',
          archivedAt: null,
          archivistFullName: null,
        });

        // when
        const screen = await visit(`/certification-centers/${certificationCenter.id}`);

        // then

        assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Membres' })).exists();
      });
    });
  });

  module('when certification center is archived', function () {
    test('does not display "Archive" button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
        archivedAt: new Date(),
        archivistFullName: null,
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Archiver' })).doesNotExist();
    });

    test('displays archived at date and archivist full name', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
        archivedAt: new Date('2023-01-01'),
        archivistFullName: 'John Doe',
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.dom(screen.getByText('Archivé le 01/01/2023 par John Doe.')).exists();
    });

    test('does not display navigation tab', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
        archivedAt: new Date(),
        archivistFullName: 'John Doe',
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert
        .dom(
          screen.queryByRole('navigation', {
            name: 'Navigation de la section centre de certification',
          }),
        )
        .doesNotExist();
    });

    test('does not display invitation input and members list', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationCenter = server.create('certification-center', {
        name: 'Pokemon Center',
        externalId: 'ABCDEF',
        type: 'PRO',
        archivedAt: new Date(),
        archivistFullName: 'John Doe',
      });

      // when
      const screen = await visit(`/certification-centers/${certificationCenter.id}`);

      // then

      assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail du nouveau membre' })).doesNotExist();
      assert.dom(screen.queryByRole('heading', { name: 'Membres' })).doesNotExist();
    });
  });
});
