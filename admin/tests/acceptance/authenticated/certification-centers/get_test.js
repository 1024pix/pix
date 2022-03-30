import moment from 'moment';
import { module, test } from 'qunit';
import { click, currentURL, triggerEvent, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit as visitScreen, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/certification-centers/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should access Certification center page by URL /certification-centers/:id', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

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
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
    });

    // when
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Center 1' })).exists();
    assert.dom(screen.getByText('ABCDEF')).exists();
    assert.dom(screen.getByText('Établissement scolaire')).exists();
  });

  test('should display Certification center habilitations', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });
    const habilitation1 = server.create('habilitation', { name: 'Pix+Edu' });
    const habilitation2 = server.create('habilitation', { name: 'Pix+Surf' });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
      habilitations: [habilitation1, habilitation2],
    });

    // when
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByText('Pix+Edu')).exists();
    assert.dom(screen.getByText('Pix+Surf')).exists();
  });

  test('should highlight the habilitations of the current certification center', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });
    const habilitation1 = server.create('habilitation', { name: 'Pix+Edu' });
    const habilitation2 = server.create('habilitation', { name: 'Pix+Surf' });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
      habilitations: [habilitation1, habilitation2],
    });

    server.create('habilitation', { name: 'Pix+Autre' });

    // when
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByLabelText('Habilité pour Pix+Edu')).exists();
    assert.dom(screen.getByLabelText('Habilité pour Pix+Surf')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Pix+Autre')).exists();
  });

  test('should display Certification center memberships', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });
    const certificationCenter = server.create('certification-center', {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
    });
    const certificationCenterMembership1 = server.create('certification-center-membership', {
      createdAt: new Date('2018-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user', { id: 900 }),
    });
    server.create('certification-center-membership', {
      createdAt: new Date('2019-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
    const expectedDate1 = moment(certificationCenterMembership1.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.strictEqual(screen.getAllByLabelText('Membre').length, 2);
    assert.dom(screen.getAllByLabelText('Membre')[0]).containsText(certificationCenterMembership1.user.id);
    assert.dom(screen.getByText(certificationCenterMembership1.user.id)).exists();
    assert.dom(screen.getByText(certificationCenterMembership1.user.firstName)).exists();
    assert.dom(screen.getByText(certificationCenterMembership1.user.lastName)).exists();
    assert.dom(screen.getByText(certificationCenterMembership1.user.email)).exists();
    assert.dom(screen.getByText(expectedDate1)).exists();
  });

  test('should be possible to desactive a certification center membership', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

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
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
    await clickByName('Désactiver');

    // then
    assert.dom(screen.queryByText('Lili')).doesNotExist();
  });

  module('To add certification center membership', function () {
    test('should display elements to add certification center membership', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });

      // when
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.dom(screen.getByText('Ajouter un membre')).exists();
      assert.dom(screen.getByLabelText('Adresse e-mail du nouveau membre')).exists();
      assert.dom(screen.getByText('Valider')).exists();
      assert.dom('.error').notExists;
    });

    test('should disable button if email is empty or contains spaces', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const spacesEmail = ' ';
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', spacesEmail);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]').hasAttribute('disabled');
    });

    test('should display error message and disable button if email is invalid', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', 'an invalid email');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom(screen.getByText("L'adresse e-mail saisie n'est pas valide.")).exists();
      assert.dom('button[data-test-add-membership]').hasAttribute('disabled');
    });

    test('should enable button and not display error message if email is valid', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillByLabel('Adresse e-mail du nouveau membre', 'test@example.net');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]').hasNoAttribute('disabled');
      assert.dom('.error').notExists;
    });

    test('should display new certification-center-membership', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const email = 'test@example.net';
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
      await fillByLabel('Adresse e-mail du nouveau membre', email);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // when
      await click('button[data-test-add-membership]');

      // then
      assert.dom(screen.getByLabelText('Membre')).exists();
      assert.dom(screen.getByText('test@example.net')).exists();
    });
  });

  module('Update certification center', function () {
    test('should display a form after clicking on "Editer"', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

      // when
      await clickByName('Editer');

      // then
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
    });

    test('should send edited certification center to the API', async function (assert) {
      // given
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
        isSupervisorAccessEnabled: false,
      });
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer');
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

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
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      server.create('habilitation', { name: 'Pix+Surf' });
      server.create('habilitation', { name: 'Pix+Autre' });

      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer');
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

      // when
      await fillByLabel('Nom du centre', 'Centre des réussites');
      await clickByName('Pix+Surf');
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
      const currentUser = server.create('user');
      await createAuthenticateSession({ userId: currentUser.id });
      const certificationCenter = server.create('certification-center', {
        name: 'Center 1',
        externalId: 'ABCDEF',
        type: 'SCO',
      });
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 422);
      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
      await clickByName('Editer');

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
