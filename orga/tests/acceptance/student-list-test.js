import { module, test } from 'qunit';
import { find, currentURL, triggerEvent, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Student List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let organizationId;
  let username;
  let email;

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/eleves');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    module('When organization is not managing students or is not SCO', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('should not be accessible', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When organization is managing students', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserManagingStudents();
        organizationId = user.memberships.models.firstObject.organizationId;
        username = 'firstname.lastname0112';
        email = 'firstname.lastname0112@example.net';
        server.createList('student', 5, { organizationId });
        server.create('student', {
          organizationId,
          firstName: 'FirstName',
          lastName: 'LastName',
          username,
          email,
        });

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.equal(currentURL(), '/eleves');
      });

      test('it should show title of team page', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.dom('.page-title').hasText('Élèves');
      });

      test('it should list the students', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.dom('.table thead th').exists({ count: 5 });
        assert.dom('.table tbody tr').exists({ count: 6 });
      });

      test('it should display headers labels', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.dom('.table thead th:nth-child(1)').hasText('Nom');
        assert.dom('.table thead th:nth-child(2)').hasText('Prénom');
        assert.dom('.table thead th:nth-child(3)').hasText('Date de naissance');
        assert.dom('.table thead th:nth-child(4)').hasText('Connecté avec');
        assert.dom('.table thead th:nth-child(5)').hasText('');
      });

      module('when student authenticated by username and email', async function() {

        test('it should display password reset modal button for student', async function(assert) {
          // when
          await visit('/eleves');

          // then
          assert.dom('.table tbody tr:nth-child(6) td:last-child button .fa-cog').exists();
        });

        test('it should open modal and display password reset button', async function(assert) {
          // given
          await visit('/eleves');

          // when
          await click('.table tbody tr:nth-child(6) td:last-child button');

          // then
          assert.dom('.pix-modal-overlay').exists();
          assert.dom('.pix-modal-footer button').exists();
          assert.dom('.pix-modal-footer button').hasText('Réinitialiser le mot de passe');
        });

        test('it should display unique password input when reset button is clicked', async function(assert) {
          // given
          await visit('/eleves');
          await click('.table tbody tr:nth-child(6) td:last-child button');

          // when
          await click('.pix-modal-footer div button');

          // then
          assert.dom('.pix-modal-footer div button').doesNotExist();
          assert.dom('#generated-password').exists();
        });

        test('it should open password modal window with email and username value', async function(assert) {

          // given
          await visit('/eleves');

          // when
          await click('.table tbody tr:nth-child(6) td:last-child button');

          // then
          assert.dom('.pix-modal-overlay').exists();
          assert.dom('#username').hasValue(username);
          assert.dom('#email').hasValue(email);
        });
      });

      module('when student authenticated by username )', async function() {

        test('it should open password modal window with username value', async function(assert) {
          // given
          await visit('/eleves');

          // when
          await click('.table tbody tr:nth-child(6) td:last-child button');

          // then
          assert.dom('.pix-modal-overlay').exists();
          assert.dom('#username').hasValue(username);
        });

      });

      module('when student authenticated by email )', async function() {

        test('it should open password modal window with email value', async function(assert) {

          // given
          await visit('/eleves');

          // when
          await click('.table tbody tr:nth-child(6) td:last-child button');

          // then
          assert.dom('.pix-modal-overlay').exists();
          assert.dom('#email').hasValue(email);
        });

      });

    });

    module('When user is admin in organization', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserManagingStudents('ADMIN');
        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should display import button', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.dom('.button').hasText('Importer (.xml)');
      });

      test('it should display success message and reload students', async function(assert) {
        // given
        await visit('/eleves');

        const file = new Blob(['foo'], { type: 'valid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="success"]').exists();
        assert.dom('[data-test-notification-message="success"]').hasText('La liste a été importée avec succès.');
        assert.dom('.table tbody tr').exists({ count: 1 });
        assert.dom('.table tbody tr td:first-child').hasText('Cover');
        assert.dom('.table tbody tr td:nth-child(2)').hasText('Harry');
      });

      test('it should display an error message when uploading an invalid file', async function(assert) {
        // given
        await visit('/eleves');

        const file = new Blob(['foo'], { type: 'invalid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('422 - Le détail affiché est envoyé par le back');
      });

      test('it should display an error message when uploading a file with students informations problems', async function(assert) {
        // given
        await visit('/eleves');

        const file = new Blob(['foo'], { type: 'file-with-students-info-problems' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('409 - Le détail affiché est envoyé par le back');
      });

      test('it should display an error message when something unexpected went wrong on the client', async function(assert) {
        // given
        await visit('/eleves');

        const file = new Blob(['foo'], { type: 'file-with-problems' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('400 - détail. Veuillez réessayer ou nous contacter via le formulaire du centre d\'aide.');
      });

      test('it should display an error message when something unexpected went wrong on the server', async function(assert) {
        // given
        await visit('/eleves');

        const file = new Blob(['foo'], { type: '' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('Quelque chose s\'est mal passé. Veuillez réessayer.');
      });
    });

    module('When user is not admin in organization', function() {

      test('it should not display import button', async function(assert) {
        // given
        user = createUserManagingStudents('MEMBER');
        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });

        // when
        await visit('/eleves');

        // then
        assert.dom('.button').doesNotExist();
      });

    });

  });
});
