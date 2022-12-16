import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import { visit } from '@1024pix/ember-testing-library';
import { setupIntl, t } from 'ember-intl/test-support';

import { CREATED, FINALIZED } from 'pix-certif/models/session';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
        isEndTestScreenRemovalEnabled: false,
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
        const sessionCreated = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${sessionCreated.id}`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    module('when looking at the session details', function () {
      module('when the session is not finalized', function () {
        module('when the session is CREATED', function () {
          test('it should not display the finalize button if no candidate has joined the session', async function (assert) {
            // given
            const sessionCreated = server.create('session', { id: 123, status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: false, sessionId: sessionCreated.id });

            // when
            const screen = await visit(`/sessions/${sessionCreated.id}`);
            const updateButton = screen.getByRole('link', {
              name: t('pages.sessions.detail.parameters.session-update', { sessionId: 123 }),
            });
            const finalizeButton = screen.queryByRole('button', {
              name: t('pages.sessions.detail.parameters.finalize'),
            });

            // then
            assert.dom(updateButton).exists();
            assert.dom(finalizeButton).doesNotExist();
          });

          test('it should redirect to finalize page on click on finalize button', async function (assert) {
            // given
            const sessionCreatedAndStarted = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: true, sessionId: sessionCreatedAndStarted.id });

            // when
            const screen = await visit(`/sessions/${sessionCreatedAndStarted.id}`);
            const finalizeButton = screen.getByRole('link', { name: t('pages.sessions.detail.parameters.finalizing') });

            await click(finalizeButton);

            // then
            assert.strictEqual(currentURL(), `/sessions/${sessionCreatedAndStarted.id}/finalisation`);
          });

          module('when the certification center is not in the end test screen removal whitelist', function () {
            test('it should not display supervisor password', async function (assert) {
              // given
              const sessionWithSupervisorPassword = server.create('session', {
                supervisorPassword: 'SOWHAT',
                status: CREATED,
              });

              // when
              const screen = await visit(`/sessions/${sessionWithSupervisorPassword.id}`);

              // then
              const supervisorPasswordElement = screen.queryByText(
                t('pages.sessions.detail.parameters.session-password')
              );
              assert.dom(supervisorPasswordElement).doesNotExist();
            });
          });

          module('when the certification center is in the end test screen removal whitelist', function () {
            test('it should display supervisor password', async function (assert) {
              // given
              allowedCertificationCenterAccess.update({ isEndTestScreenRemovalEnabled: true });
              const sessionWithSupervisorPassword = server.create('session', {
                supervisorPassword: 'SOWHAT',
                status: CREATED,
              });

              // when
              const screen = await visit(`/sessions/${sessionWithSupervisorPassword.id}`);

              // then
              const supervisorPasswordElement = screen.getByText('C-SOWHAT');
              assert.dom(supervisorPasswordElement).exists();
            });
          });
        });
      });

      module('when the session is finalized', function (hooks) {
        let sessionFinalized;

        hooks.beforeEach(function () {
          sessionFinalized = server.create('session', { status: FINALIZED });
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionFinalized.id });
        });

        test('it should show a "session already finalized" warning', async function (assert) {
          // when
          const screen = await visit(`/sessions/${sessionFinalized.id}`);

          // then
          const finalizeText = screen.getByText(t('pages.sessions.detail.parameters.finalization-info'));
          const finalizeButton = screen.queryByRole('button', { name: t('finalizing') });

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
            'error raised when visiting finalisation route'
          );
        });
      });
    });
  });
});
