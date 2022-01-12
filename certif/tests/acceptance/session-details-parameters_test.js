import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { visit } from '@1024pix/ember-testing-library';

import { CREATED, FINALIZED } from 'pix-certif/models/session';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details Parameters', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
        const sessionCreated = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${sessionCreated.id}`);

        // then
        assert.equal(currentURL(), '/espace-ferme');
      });
    });

    module('when looking at the session details', function () {
      module('when the session is not finalized', function () {
        module('when the session is CREATED', function () {
          test('it should not display the finalize button if no candidate has joined the session', async function (assert) {
            // given
            const sessionCreated = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: false, sessionId: sessionCreated.id });

            // when
            await visit(`/sessions/${sessionCreated.id}`);

            // then
            assert.notContains('Finaliser la session');
          });

          test('it should redirect to finalize page on click on finalize button', async function (assert) {
            // given
            const sessionCreatedAndStarted = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: true, sessionId: sessionCreatedAndStarted.id });

            // when
            await visit(`/sessions/${sessionCreatedAndStarted.id}`);
            await clickByLabel('Finaliser la session');

            // then
            assert.equal(currentURL(), `/sessions/${sessionCreatedAndStarted.id}/finalisation`);
          });

          module('when the feature toggle FT_END_TEST_SCREEN_REMOVAL_ENABLED is disabled', function () {
            test('it should not display supervisor password', async function (assert) {
              // given
              server.create('feature-toggle', {
                id: 0,
                isEndTestScreenRemovalEnabled: false,
              });
              const sessionWithSupervisorPassword = server.create('session', {
                supervisorPassword: 'SOWHAT',
                status: CREATED,
              });

              // when
              const screen = await visit(`/sessions/${sessionWithSupervisorPassword.id}`);

              // then
              const supervisorPasswordElement = screen.queryByText('C-SOWHAT');
              assert.dom(supervisorPasswordElement).doesNotExist();
            });
          });

          module('when the feature toggle FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
            test('it should display supervisor password', async function (assert) {
              // given
              server.create('feature-toggle', {
                id: 0,
                isEndTestScreenRemovalEnabled: true,
              });
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

        test('it should not redirect to finalize page on click on finalize button', async function (assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          await clickByLabel('Finaliser la session');

          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
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
