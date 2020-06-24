import { module, test } from 'qunit';
import { find, currentURL, triggerEvent, visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents,
  createPrescriberByUser
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Student List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let organizationId;
  let username;
  let email;

  module('When prescriber is not logged in', function() {

    test('it should not be accessible by an unauthenticated prescriber', async function(assert) {
      // when
      await visit('/eleves');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function(hooks) {

    let user;

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    module('When organization is not managing students or is not SCO', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);

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

    module('When prescriber is looking for students', function(hooks) {
      hooks.beforeEach(async () => {
        user = createUserManagingStudents();
        createPrescriberByUser(user);

        organizationId = user.memberships.models.firstObject.organizationId;

        server.create('student', { organizationId, firstName: 'Chuck', lastName: 'Norris', hasEmail: false });
        server.create('student', { organizationId, firstName: 'John', lastName: 'Rambo', hasEmail: true });

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should display the students list filtered by lastname', async function(assert) {
        // when
        await visit('/eleves');
        await fillIn('[placeholder="Rechercher par nom"]', 'ambo');
        // then
        assert.equal(currentURL(), '/eleves?lastName=ambo');
        assert.contains('Rambo');
        assert.notContains('Norris');
      });

      test('it should display the students list filtered by firstname', async function(assert) {
        // when
        await visit('/eleves');
        await fillIn('[placeholder="Rechercher par prénom"]', 'Jo');
      
        // then
        assert.equal(currentURL(), '/eleves?firstName=Jo');
        assert.contains('Rambo');
        assert.notContains('Norris');
      });

      test('it should display the students list filtered by connexion type', async function(assert) {
        // when
        await visit('/eleves');
        await fillIn('select', 'email');

        // then
        assert.equal(currentURL(), '/eleves?connexionType=email');
        assert.contains('Rambo');
        assert.notContains('Norris');
      });

      test('it should paginate the students list', async function(assert) {
        // when
        await visit('/eleves?pageSize=1&pageNumber=1');
      
        // then
        assert.contains('Norris');
        assert.notContains('Rambo');
      });
    });

    module('When organization is managing students', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserManagingStudents();
        createPrescriberByUser(user);

        organizationId = user.memberships.models.firstObject.organizationId;

        server.createList('student', 5, { organizationId });

        username = 'firstname.lastname0112';
        email = 'firstname.lastname0112@example.net';
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

      module('when student authenticated by username and email', async function() {

        test('it should open modal and display password reset button', async function(assert) {
          // given
          await visit('/eleves');

          // when
          await click('[aria-label="Afficher les actions"]');
          await click('li');

          // then
          assert.contains('Réinitialiser le mot de passe');
        });

        test('it should display unique password input when reset button is clicked', async function(assert) {
          // given
          await visit('/eleves');
          await click('[aria-label="Afficher les actions"]');
          await click('li');

          // when
          await click('#generate-password');

          // then
          assert.dom('#generate-password').doesNotExist();
          assert.dom('#generated-password').exists();
        });

        test('it should open password modal window with email and username value', async function(assert) {

          // given
          await visit('/eleves');

          // when
          await click('[aria-label="Afficher les actions"]');
          await click('li');

          // then
          assert.dom('#username').hasValue(username);
          assert.dom('#email').hasValue(email);
        });
      });

      module('when student authenticated by username', async function() {

        test('it should open password modal window with username value', async function(assert) {
          // given
          await visit('/eleves');

          // when
          await click('[aria-label="Afficher les actions"]');
          await click('li');

          // then
          assert.dom('#username').hasValue(username);
        });

      });

      module('when student authenticated by email', async function() {

        test('it should open password modal window with email value', async function(assert) {

          // given
          await visit('/eleves');

          // when
          await click('[aria-label="Afficher les actions"]');
          await click('li');

          // then
          assert.dom('#email').hasValue(email);
        });
      });
    });

    module('When admin uploads a file', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserManagingStudents('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
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
        assert.dom('[aria-label="Élève"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
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
  });

});
