import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let sessionFinalized;
  let sessionNotFinalized;

  hooks.beforeEach(function() {
    user = createUserWithMembership();
    sessionFinalized = server.create('session', { status: 'finalized' });
    sessionNotFinalized = server.create('session', { status: 'started' });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit(`/sessions/${sessionFinalized.id}`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    module('when finalize feature is deactivated', function(hooks) {

      hooks.beforeEach(async function() {
        const controller = this.owner.lookup('controller:authenticated.sessions.details.parameters');
        controller.set('isSessionFinalizationActive', false);
      });

      test('it should be accessible for an authenticated user', async function(assert) {
        // when
        await visit(`/sessions/${sessionFinalized.id}`);

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
      });

      test('it should redirect to update page on click on update button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__update-button');

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalized.id}/modification`);
      });

      test('it should redirect to update page on click on return button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__return-button');

        // then
        assert.equal(currentURL(), '/sessions/liste');
      });

    });

    module('when finalize feature is activated', function(hooks) {

      hooks.beforeEach(async function() {
        const controller = this.owner.lookup('controller:authenticated.sessions.details.parameters');
        controller.set('isSessionFinalizationActive', true);
      });

      test('it should still redirect to update page on click on return button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__return-button');

        // then
        assert.equal(currentURL(), '/sessions/liste');
      });

      module('when the session is not finalized', function() {

        module('when the session has not started', function() {
          test('it should not display the finalize button', async function(assert) {
            // when
            await visit(`/sessions/${sessionNotFinalized.id}`);

            // then
            assert.dom('.session-details-content__finalize-button').doesNotExist();
          });
        });

        module('when the session has started', function() {
          test('it should redirect to finalize page on click on finalize button', async function(assert) {
            // given
            const candidatesWithStartingCertif = server.createList('certification-candidate', 2, { isLinked: true });
            sessionNotFinalized.update({ certificationCandidates: candidatesWithStartingCertif });
            await visit(`/sessions/${sessionNotFinalized.id}`);

            // when
            await click('.session-details-content__finalize-button');

            // then
            assert.equal(currentURL(), `/sessions/${sessionNotFinalized.id}/finalisation`);
          });
        });
      });

      module('when the session is finalized', function() {

        hooks.beforeEach(async function() {
          const candidatesWithStartingCertif = server.createList('certification-candidate', 2, { isLinked: true });
          sessionFinalized.update({ certificationCandidates: candidatesWithStartingCertif });
        });

        test('it should not redirect to finalize page on click on finalize button', async function(assert) {
          // given
          await visit(`/sessions/${sessionFinalized.id}`);

          // when
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
        });

        test('it should throw an error on visiting /finalisation url', async function(assert) {
          // given
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
