import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { CREATED, FINALIZED } from 'pix-certif/models/session-management';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session Details Parameters', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when certificationPointOfContact is logged in', function (hooks) {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;

    hooks.beforeEach(async () => {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
        pixCertifTermsOfServiceAccepted: true,
      });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        const sessionCreated = server.create('session-enrolment', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        server.create('session-management', {
          id: sessionCreated.id,
        });
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${sessionCreated.id}`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    module('when looking at the session details', function () {
      test('should display details parameters information', async function (assert) {
        // given
        const sessionCreated = server.create('session-enrolment', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        server.create('session-management', {
          id: sessionCreated.id,
        });

        // when
        const screen = await visit(`/sessions/${sessionCreated.id}`);

        // then
        assert.dom(screen.getByRole('heading', { name: 'Numéro de session', level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: "Code d'accès Candidat", level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Mot de passe de session Surveillant', level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Nom du site', level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Salle', level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Surveillant(s)', level: 3 })).exists();

        assert.dom(screen.getByRole('button', { name: 'Copier le numéro de session' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Copier le code d’accès à la session' })).exists();
        assert
          .dom(screen.getByRole('button', { name: 'Copier le mot de passe de session pour le surveillant' }))
          .exists();
      });

      module('when the session is not finalized', function () {
        module('when the session is CREATED', function () {
          test('it should not display the finalize button if no candidate has joined the session', async function (assert) {
            // given
            const sessionCreated = server.create('session-enrolment', {
              id: 123,
              status: CREATED,
              certificationCenterId: allowedCertificationCenterAccess.id,
            });
            server.createList('certification-candidate', 2, { isLinked: false, sessionId: sessionCreated.id });
            server.create('session-management', {
              id: sessionCreated.id,
              status: CREATED,
            });

            // when
            const screen = await visit(`/sessions/${sessionCreated.id}`);

            // then
            const updateButton = screen.getByRole('link', { name: 'Modifier les informations de la session 123' });
            const finalizeButton = screen.queryByRole('button', { name: 'Finaliser la session' });
            assert.dom(updateButton).exists();
            assert.dom(finalizeButton).doesNotExist();
          });

          test('it should display supervisor password', async function (assert) {
            // given
            const sessionWithSupervisorPassword = server.create('session-enrolment', {
              supervisorPassword: 'SOWHAT',
              status: CREATED,
              certificationCenterId: allowedCertificationCenterAccess.id,
            });
            server.create('session-management', {
              id: sessionWithSupervisorPassword.id,
            });

            // when
            const screen = await visit(`/sessions/${sessionWithSupervisorPassword.id}`);

            // then
            const supervisorPasswordElement = screen.getByText('C-SOWHAT');
            assert.dom(supervisorPasswordElement).exists();
          });

          module('when finalize button is clicked', function () {
            test('it should redirect to finalize page', async function (assert) {
              // given
              const sessionCreatedAndStarted = server.create('session-enrolment', {
                certificationCenterId: allowedCertificationCenterAccess.id,
              });
              server.createList('certification-candidate', 2, {
                isLinked: true,
                sessionId: sessionCreatedAndStarted.id,
              });
              server.create('session-management', {
                id: sessionCreatedAndStarted.id,
                status: CREATED,
              });

              // when
              const screen = await visit(`/sessions/${sessionCreatedAndStarted.id}`);
              const finalizeButton = screen.getByRole('link', { name: 'Finaliser la session' });

              await click(finalizeButton);

              // then
              assert.strictEqual(currentURL(), `/sessions/${sessionCreatedAndStarted.id}/finalisation`);
            });

            module('when certification reports recovery fails', function () {
              test('it should return error message', async function (assert) {
                // given
                const sessionCreatedAndStarted = server.create('session-enrolment', {
                  status: CREATED,
                  certificationCenterId: allowedCertificationCenterAccess.id,
                });
                server.createList('certification-candidate', 2, {
                  isLinked: true,
                  sessionId: sessionCreatedAndStarted.id,
                });
                server.create('session-management', {
                  id: sessionCreatedAndStarted.id,
                });
                this.server.get('/sessions/:id/certification-reports', () => {
                  return new Response(500, {}, { errors: [{ status: '500' }] });
                });

                // when
                const screen = await visit(`/sessions/${sessionCreatedAndStarted.id}`);

                const finalizeButton = screen.getByRole('link', { name: 'Finaliser la session' });
                await click(finalizeButton);

                // then
                assert
                  .dom(
                    screen.getByText(
                      'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
                    ),
                  )
                  .exists();
                assert.strictEqual(currentURL(), `/sessions/${sessionCreatedAndStarted.id}`);
              });
            });
          });
        });
      });

      module('when the session is finalized', function (hooks) {
        let sessionFinalized;

        hooks.beforeEach(function () {
          sessionFinalized = server.create('session-enrolment', {
            certificationCenterId: allowedCertificationCenterAccess.id,
          });
          server.create('session-management', {
            id: sessionFinalized.id,
            status: FINALIZED,
          });
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionFinalized.id });
        });

        test('it should show a "session already finalized" warning', async function (assert) {
          // when
          const screen = await visit(`/sessions/${sessionFinalized.id}`);

          // then
          const finalizeText = screen.getByText(
            'Les informations de finalisation de la session ont déjà été transmises aux équipes de Pix.',
          );
          const finalizeButton = screen.queryByRole('button', { name: 'Finaliser la session' });

          assert.dom(finalizeText).exists();
          assert.dom(finalizeButton).doesNotExist();
        });

        test('it should throw an error on visiting /finalisation url', async function (assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          const transitionError = new Error('TransitionAborted');

          // then
          assert.rejects(
            visit(`/sessions/${sessionFinalized.id}/finalisation`),
            transitionError,
            'error raised when visiting finalisation route',
          );
        });
      });
    });
  });
});
