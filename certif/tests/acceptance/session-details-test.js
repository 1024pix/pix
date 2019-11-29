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
  let sessionFinalizedId;
  let sessionNotFinalizedId;

  hooks.beforeEach(function() {
    user = createUserWithMembership();
    sessionFinalizedId = server.create('session', { id: 1, status: 'finalized' }).id;
    sessionNotFinalizedId = server.create('session', { id: 2, status: 'started' }).id;
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notification-messages');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit(`/sessions/${sessionFinalizedId}`);

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
        await visit(`/sessions/${sessionFinalizedId}`);

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalizedId}`);
      });

      test('it should redirect to update page on click on update button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalizedId}`);

        // when
        await click('.session-details-content__update-button');

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalizedId}/modification`);
      });

      test('it should redirect to update page on click on return button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalizedId}`);

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
        await visit(`/sessions/${sessionFinalizedId}`);

        // when
        await click('.session-details-content__return-button');

        // then
        assert.equal(currentURL(), '/sessions/liste');
      });

      module('when the session is not finalized', function() {
        test('it should redirect to finalize page on click on finalize button', async function(assert) {
          // given
          await visit(`/sessions/${sessionNotFinalizedId}`);

          // when
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionNotFinalizedId}/finalisation`);
        });
      });

      module('when the session is finalized', function() {
        test('it should not redirect to finalize page on click on finalize button', async function(assert) {
          // given
          await visit(`/sessions/${sessionFinalizedId}`);

          // when
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalizedId}`);
        });

        test('it should throw an error on visiting /finalisation url', async function(assert) {
          // given
          await visit(`/sessions/${sessionFinalizedId}`);
          const transitionError = new Error('TransitionAborted');

          // then
          assert.rejects(
            visit(`/sessions/${sessionFinalizedId}/finalisation`),
            transitionError,
            'error raised when visiting finalisation route'
          );
        });
      });

    });

  });

});
