import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import { CREATED, FINALIZED } from 'pix-certif/models/session';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details Parameters', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when certificationPointOfContact is logged in', function(hooks) {

    let certificationPointOfContact;

    hooks.beforeEach(async () => {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when looking at the session details', function() {

      module('when the session is not finalized', function() {

        module('when the session is CREATED', function() {

          test('it should not display the finalize button if no candidat has joined the session', async function(assert) {
            // given
            const sessionCreated = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: false, sessionId: sessionCreated.id });

            // when
            await visit(`/sessions/${sessionCreated.id}`);

            // then
            assert.dom('.session-details-content__finalize-button').doesNotExist();
          });

          test('it should redirect to finalize page on click on finalize button', async function(assert) {
            // given
            const sessionCreatedAndStarted = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: true, sessionId: sessionCreatedAndStarted.id });

            // when
            await visit(`/sessions/${sessionCreatedAndStarted.id}`);
            await click('.session-details-content__finalize-button');

            // then
            assert.equal(currentURL(), `/sessions/${sessionCreatedAndStarted.id}/finalisation`);
          });
        });
      });

      module('when the session is finalized', function(hooks) {

        let sessionFinalized;

        hooks.beforeEach(function() {
          sessionFinalized = server.create('session', { status: FINALIZED });
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionFinalized.id });
        });

        test('it should not redirect to finalize page on click on finalize button', async function(assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
        });

        test('it should throw an error on visiting /finalisation url', async function(assert) {
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
