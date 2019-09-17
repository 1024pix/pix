import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';
import { upload } from 'ember-file-upload/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(function() {
    user = createUserWithMembership();
    server.create('session', { id: 1 });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notification-messages');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/1');

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
      await visit('/sessions/1');

      // then
      assert.equal(currentURL(), '/sessions/1');
    });

    test('it should redirect to update page on click on update button', async function(assert) {
      // given
      await visit('/sessions/1');

      // when
      await click('.session-details-content__update-button');

      // then
      assert.equal(currentURL(), '/sessions/1/modification');
    });

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      await visit('/sessions/1');

      // when
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should display a download button', async function(assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.dom('.session-details-controls__download-button').hasText('Télécharger le PV (.ods)');
    });

    test('it should display an import button', async function(assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.dom('.session-details-controls__import-button').hasText('Importer des candidats (.ods)');
    });

    module('notifications', function() {

      test('it should display a success message when uploading a valid file', async function(assert) {
        // given
        await visit('/sessions/1');
        const file = new File(['foo'], 'valid-file');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="success"]').exists();
      });

      test('it should display an error message when uploading an invalid file', async function(assert) {
        // given
        await visit('/sessions/1');
        const file = new File(['foo'], 'invalid-file');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
      });

    });

  });

});
