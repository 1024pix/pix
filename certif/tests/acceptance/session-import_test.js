import { module, test } from 'qunit';
import { click, currentURL, triggerEvent, settled } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';

/* eslint-disable ember/no-settled-after-test-helper */
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

      this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
        return new Response(
          200,
          {},
          { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
        );
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
          await settled();

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
        });

        test('it should disable the import button before and after import', async function (assert) {
          // given
          const blob = new Blob(['foo']);
          const file = new File([blob], 'fichier.csv');

          // when
          screen = await visit('/sessions/import');
          const importButton = screen.getByRole('button', { name: 'Continuer' });
          assert.dom(importButton).hasAttribute('disabled');
          const input = await screen.findByLabelText('Importer le modèle complété');
          await triggerEvent(input, 'change', { files: [file] });
          assert.dom(importButton).doesNotHaveAttribute('disabled');
          await click(importButton);

          // then
          assert.dom(importButton).hasAttribute('disabled');
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
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
            const { getAllByRole, getByLabelText, getByRole, queryByLabelText } = await visit('/sessions/import');
            const importButton = getByLabelText('Importer le modèle complété');
            await triggerEvent(importButton, 'change', { files: [file] });
            const importConfirmationButton = getByRole('button', { name: 'Continuer' });
            await click(importConfirmationButton);

            // when
            const outLink = getByRole('link', { name: 'Revenir à la liste des sessions' });
            await click(outLink);
            await click(getByRole('link', { name: 'Créer/éditer plusieurs sessions' }));

            // then
            assert.dom(importButton).exists();
            assert.dom(queryByLabelText('fichier.csv')).doesNotExist();
            assert
              .dom(getAllByRole('listitem').find((listItem) => listItem.textContent?.trim() === 'Import du modèle'))
              .hasAttribute('aria-current', 'step');
            assert
              .dom(getAllByRole('listitem').find((listItem) => listItem.textContent?.trim() === 'Récapitulatif'))
              .hasAttribute('aria-current', '');
          });
        });

        module('when cancelling the import', function () {
          test("it should remove the file's name", async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            await settled();
            const cancelButton = await screen.findByLabelText("Annuler l'import");
            await click(cancelButton);
            await settled();

            // then
            assert.dom(await screen.queryByLabelText('fichier.csv')).doesNotExist();
          });
        });

        module('when the file is valid', function () {
          test('it should display the sessions and candidates count', async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
            this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
              return new Response(
                200,
                {},
                {
                  sessionsCount: 2,
                  sessionsWithoutCandidatesCount: 1,
                  candidatesCount: 3,
                  errorReports: [],
                },
              );
            });

            // when
            const { getAllByRole, getByLabelText, getByRole, getByText, queryByLabelText } =
              await visit('/sessions/import');
            const input = getByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = getByRole('button', { name: 'Continuer' });
            await click(importButton);
            await settled();

            // then
            assert.dom(getByText('2 sessions dont 1 session sans candidat')).exists();
            assert.dom(getByText('3 candidats')).exists();
            assert
              .dom(getAllByRole('listitem').find((listItem) => listItem.textContent?.trim() === 'Récapitulatif'))
              .hasAttribute('aria-current', 'step');
            assert
              .dom(getAllByRole('listitem').find((listItem) => listItem.textContent?.trim() === 'Import du modèle'))
              .hasAttribute('aria-current', '');
            assert.dom(queryByLabelText('fichier.csv')).doesNotExist();
          });

          module('when there is only non blocking errors', function () {
            test('it should allow session creation anyway', async function (assert) {
              // given
              const blob = new Blob(['foo']);
              const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
              this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                return new Response(
                  200,
                  {},
                  {
                    sessionsCount: 2,
                    sessionsWithoutCandidatesCount: 1,
                    candidatesCount: 3,
                    errorReports: [{ code: 'EMPTY_SESSION', line: 1, blocking: false }],
                  },
                );
              });

              // when
              screen = await visit('/sessions/import');
              const input = screen.getByLabelText('Importer le modèle complété');
              await triggerEvent(input, 'change', { files: [file] });
              const importButton = screen.getByRole('button', { name: 'Continuer' });
              await click(importButton);
              await settled();

              // then
              assert.dom(screen.getByRole('button', { name: 'Finaliser quand même la création/édition' })).exists();
            });
          });

          module('when the user has confirmed the import', function () {
            test("it should redirect to the session's list", async function (assert) {
              // given
              const blob = new Blob(['foo']);
              const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
              this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                return new Response(
                  200,
                  {},
                  { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                );
              });

              this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                return new Response(
                  200,
                  {},
                  { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3 },
                );
              });

              // when
              screen = await visit('/sessions/import');
              const input = screen.getByLabelText('Importer le modèle complété');
              await triggerEvent(input, 'change', { files: [file] });
              const importButton = screen.getByRole('button', { name: 'Continuer' });
              await click(importButton);
              await settled();
              const confirmButton = screen.getByRole('button', { name: 'Finaliser la création/édition' });
              await click(confirmButton);
              await settled();

              // then
              assert.strictEqual(currentURL(), '/sessions/liste');
            });

            module('when there is one session', function () {
              test('it should display a success notification', async function (assert) {
                // given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 1, sessionsWithoutCandidatesCount: 0, candidatesCount: 1, errorReports: [] },
                  );
                });

                this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 1, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                  );
                });

                // when
                screen = await visit('/sessions/import');
                const input = screen.getByLabelText('Importer le modèle complété');
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: 'Continuer' });
                await click(importButton);
                await settled();
                const confirmButton = screen.getByRole('button', { name: 'Finaliser la création/édition' });
                await click(confirmButton);
                await settled();

                // then
                assert
                  .dom(
                    screen.getByText(
                      'Succès ! 1 session dont 0 session sans candidat créée et 1 candidat créé ou édité',
                    ),
                  )
                  .exists();
              });
            });

            module('when there is more than one session', function () {
              test('it should display a pluralized success notification', async function (assert) {
                // given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                  );
                });

                this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                  );
                });

                // when
                screen = await visit('/sessions/import');
                const input = screen.getByLabelText('Importer le modèle complété');
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: 'Continuer' });
                await click(importButton);
                await settled();
                const confirmButton = screen.getByRole('button', { name: 'Finaliser la création/édition' });
                await click(confirmButton);
                await settled();

                // then
                assert
                  .dom(
                    screen.getByText(
                      'Succès ! 2 sessions dont 0 session sans candidat créées et 3 candidats créés ou édités',
                    ),
                  )
                  .exists();
              });
            });
          });
        });

        module('when the file is not valid', function () {
          test('it should display an error notification', async function (assert) {
            //given
            const file = new Blob(['foo']);
            this.server.post(
              '/certification-centers/:id/sessions/validate-for-mass-import',
              () =>
                new Response(
                  422,
                  { some: 'header' },
                  {
                    errors: [
                      {
                        code: 'CSV_HEADERS_NOT_VALID',
                        status: '422',
                        title: 'Unprocessable Entity',
                      },
                    ],
                  },
                ),
            );

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);
            await settled();

            // then
            assert.dom(screen.getByText('Le modèle a été altéré, merci de le télécharger à nouveau')).exists();
          });

          test('it should not go to step two', async function (assert) {
            //given
            const file = new Blob(['foo']);
            this.server.post(
              '/certification-centers/:id/sessions/validate-for-mass-import',
              () =>
                new Response(
                  422,
                  { some: 'header' },
                  {
                    errors: [
                      {
                        code: 'INVALID_DOCUMENT',
                        status: '422',
                        title: 'Unprocessable Entity',
                        detail: 'Fichier non valide',
                      },
                    ],
                  },
                ),
            );

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);

            // then
            assert.dom(screen.getByRole('button', { name: 'Télécharger le modèle vierge' })).exists();
          });
        });

        module('when file headers have been modified', function () {
          test('it should display an error notification', async function (assert) {
            //given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
            this.server.post(
              '/certification-centers/:id/sessions/validate-for-mass-import',
              () =>
                new Response(
                  422,
                  { some: 'header' },
                  {
                    errors: [
                      {
                        code: 'CSV_HEADERS_NOT_VALID',
                      },
                    ],
                  },
                ),
            );

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);
            await settled();

            // then
            assert.dom(screen.getByText('Le modèle a été altéré, merci de le télécharger à nouveau')).exists();
          });
        });

        module('when the file is empty', function () {
          test('it should display an error notification', async function (assert) {
            //given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
            this.server.post(
              '/certification-centers/:id/sessions/validate-for-mass-import',
              () =>
                new Response(
                  422,
                  { some: 'header' },
                  {
                    errors: [
                      {
                        code: 'CSV_DATA_REQUIRED',
                      },
                    ],
                  },
                ),
            );

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);
            await settled();

            // then
            assert
              .dom(
                screen.getByText(
                  "Le modèle importé n'a pas été rempli, merci de le compléter avant de l'importer à nouveau",
                ),
              )
              .exists();
          });
        });

        module('when sessions validation fails with a 500 http error', function () {
          test('it should display an error notification with the default error message', async function (assert) {
            //given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
            this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => new Response(500));

            // when
            screen = await visit('/sessions/import');
            const input = await screen.findByLabelText('Importer le modèle complété');
            await triggerEvent(input, 'change', { files: [file] });
            const importButton = screen.getByRole('button', { name: 'Continuer' });
            await click(importButton);
            await settled();

            // then
            assert
              .dom(
                screen.getByText(
                  'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
                ),
              )
              .exists();
          });
        });
      });
    });
  });
});
/* eslint-enable ember/no-settled-after-test-helper */
