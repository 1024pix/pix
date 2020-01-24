import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Finalization', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let session;

  hooks.beforeEach(function() {
    user = createUserWithMembership();
    const certificationCenterId = user.certificationCenterMemberships.models[0].certificationCenterId;
    session = server.create('session', { certificationCenterId });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

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

    test('it should be accessible for an authenticated user', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.equal(currentURL(), `/sessions/${session.id}/finalisation`);
    });

    module('When user click on "Finaliser" button', function(hooks) {

      let finalizeController;

      hooks.beforeEach(function() {
        finalizeController = this.owner.lookup('controller:authenticated.sessions.finalize');
        return visit(`/sessions/${session.id}/finalisation`);
      });

      test('it should allow the user to comment the session in textarea', async function(assert) {
        // given
        const expectedComment = 'You are a wizard Harry!';
        const expectedIndicator = expectedComment.length + ' / 500';

        // when
        await fillIn('#examiner-global-comment', 'You are a wizard Harry!');

        // then
        assert.equal(finalizeController.model.examinerGlobalComment, expectedComment);
        assert.dom('.session-finalization-examiner-global-comment-step__characters-information').exists();
        assert.dom('.session-finalization-examiner-global-comment-step__characters-information').hasText(expectedIndicator);
      });

      test('it should open the confirm modal', async function(assert) {
        // when
        await click('[data-test-id="session-finalizer__button"]');

        // then
        assert.equal(finalizeController.showConfirmModal, true);
        assert.equal(currentURL(), `/sessions/${session.id}/finalisation`);
      });

      module('when confirm modal is open', function(hooks) {
        hooks.beforeEach(function() {
          return click('[data-test-id="session-finalizer__button"]');
        });

        test('it should close the modal on "fermer" cross click', async function(assert) {
          // when
          await click('[data-test-id="finalize-session-modal__close-cross"]');

          // then
          assert.equal(finalizeController.showConfirmModal, false);
          assert.equal(currentURL(), `/sessions/${session.id}/finalisation`);
        });

        test('it should close the modal on cancel button click', async function(assert) {
          // when
          await click('[data-test-id="finalize-session-modal__cancel-button"]');

          // then
          assert.equal(finalizeController.showConfirmModal, false);
          assert.equal(currentURL(), `/sessions/${session.id}/finalisation`);
        });

        test('it should close the modal on confirm button click', async function(assert) {
          // when
          await click('[data-test-id="finalize-session-modal__confirm-button"]');

          // then
          assert.equal(finalizeController.showConfirmModal, false);
        });

        test('it should redirect to session details page on confirm button click', async function(assert) {
          // when
          await click('[data-test-id="finalize-session-modal__confirm-button"]');

          // then
          assert.equal(currentURL(), `/sessions/${session.id}`);
        });

        test('it should show a success notification on session details page', async function(assert) {
          // when
          await click('[data-test-id="finalize-session-modal__confirm-button"]');

          // then
          assert.dom('[data-test-notification-message="success"]').exists();
        });
      });
    });
  });
});
