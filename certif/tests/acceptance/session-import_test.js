import { module, test } from 'qunit';
import { click, currentURL, triggerEvent } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';

module('Acceptance | Session Import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not authenticated', function () {
    test('it should not be accessible', async function (assert) {
      // when
      await visit('/sessions/import');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is authenticated', function (hooks) {
    let allowedCertificationCenterAccess;

    hooks.beforeEach(async function () {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        id: 123,
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      });

      await authenticateSession(certificationPointOfContact.id);
    });

    module('Template download', function () {
      module('when download fails', function (hooks) {
        let screen;
        let certificationCenter;

        hooks.beforeEach(async function () {
          certificationCenter = createAllowedCertificationCenterAccess({
            certificationCenterName: 'Centre SUP',
            certificationCenterType: 'SUP',
          });
          certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [certificationCenter],
          });
          await authenticateSession(certificationPointOfContact.id);
          server.create('session-summary', { certificationCenterId: certificationCenter.id });
          server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });
        });

        test('it should display an error', async function (assert) {
          // given
          screen = await visit('/sessions/import');
          this.server.get('/certification-centers/:id/sessions/import', () => {
            return new Response(500, {}, { errors: [{ status: '500' }] });
          });
          const importButton = screen.getByRole('button', { name: 'Télécharger le modèle vierge' });

          // when
          await click(importButton);

          // then
          assert.dom(screen.getByText("Une erreur s'est produite pendant le téléchargement")).exists();
        });
      });
    });

    module('Sessions import', function () {
      module('when importing multiple sessions', function (hooks) {
        let screen;

        hooks.beforeEach(async function () {
          const certificationCenter = createAllowedCertificationCenterAccess({
            certificationCenterName: 'Centre SUP',
            certificationCenterType: 'SUP',
          });
          certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [certificationCenter],
          });
          await authenticateSession(certificationPointOfContact.id);
          server.create('session-summary', { certificationCenterId: certificationCenter.id });
          server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });
        });

        test('it should disable the import button before and after import', async function (assert) {
          // given
          const blob = new Blob(['foo']);
          const file = new File([blob], 'fichier.csv');

          // when
          screen = await visit('/sessions/import');
          const importButton = screen.getByRole('button', { name: 'Continuer' });
          assert.dom(importButton).hasClass('pix-button--disabled');
          const input = await screen.findByLabelText('Importer le modèle complété');
          await triggerEvent(input, 'change', { files: [file] });
          assert.dom(importButton).doesNotHaveClass('pix-button--disabled');
          await click(importButton);

          // then
          assert.dom(importButton).hasClass('pix-button--disabled');
        });

        test("it should display the file's name once pre-imported", async function (assert) {
          // given
          const blob = new Blob(['foo']);
          const file = new File([blob], 'fichier.csv');

          // when
          screen = await visit('/sessions/import');
          const input = await screen.findByLabelText('Importer le modèle complété');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert.dom(await screen.getByLabelText('fichier.csv')).hasText('fichier.csv');
        });

        module('when leaving page and coming back', function () {
          test('it should get back to step 1', async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv');
            screen = await visit('/sessions/import');
            const importButton = screen.getByLabelText('Importer le modèle complété');
            await triggerEvent(importButton, 'change', { files: [file] });
            const importConfirmationButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importConfirmationButton);

            // when
            const outLink = screen.getByRole('link', { name: 'Revenir à la liste des sessions' });
            await click(outLink);
            await click(screen.getByRole('link', { name: 'Créer/éditer plusieurs sessions' }));

            // then
            assert.dom(importButton).exists();
            assert.dom(screen.queryByLabelText('fichier.csv')).doesNotExist();
          });
        });

        module('when cancelling the import', function () {
          test("it should remove the file's name", async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv');

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const cancelButton = await screen.findByLabelText("Annuler l'import");
            await click(cancelButton);

            // then
            assert.dom(await screen.queryByLabelText('fichier.csv')).doesNotExist();
          });
        });

        module('when the file is valid', function () {
          test('it should display the sessions and candidates count', async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv');
            this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
              return new Response(200, {}, { sessionsCount: 2, emptySessionsCount: 1, candidatesCount: 3 });
            });

            // when
            screen = await visit('/sessions/import');
            const input = screen.getByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);

            // then
            assert.dom(screen.getByText('2 sessions dont 1 sessions sans candidat')).exists();
            assert.dom(screen.getByText('3 candidats')).exists();
            assert.dom(screen.queryByLabelText('fichier.csv')).doesNotExist();
          });
        });

        module('when the file is not valid', function () {
          test('it should display an error message and not upload any session', async function (assert) {
            //given
            const file = new Blob(['foo'], { type: 'invalid-file' });

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);

            // then
            assert.dom(screen.getByText('Fichier non valide')).exists();
          });
        });
      });
    });
  });
});
