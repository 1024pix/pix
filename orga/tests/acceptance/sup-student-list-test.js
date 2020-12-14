import { module, test } from 'qunit';
import { find, triggerEvent, visit, click, typeIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserManagingStudents,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sup Student List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function(hooks) {
    hooks.beforeEach(async function() {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    module('And uploads a file', function() {
      test('it should display success message and reload students', async function(assert) {
        // given
        await visit('/etudiants');

        const file = new Blob(['foo'], { type: 'valid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="success"]').hasText('La liste a été importée avec succès.');
        assert.dom('[aria-label="Étudiant"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
      });

      test('it should display an error message when import failed', async function(assert) {
        // given
        await visit('/etudiants');

        const file = new Blob(['foo'], { type: 'invalid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
      });
    });

    module('And edit the student number', function(hooks) {
      hooks.beforeEach(() => {
        const { organizationId } = user.memberships.models.firstObject;
        server.create('student', {
          studentNumber: '123',
          firstName: 'toto',
          lastName: 'banana',
          organizationId,
        });
        server.create('student', {
          studentNumber: '321',
          firstName: 'toto',
          lastName: 'banana',
          organizationId,
        });
      });

      test('it should update the student number', async function(assert) {
        // given
        await visit('/etudiants');

        // when
        await click('[aria-label="Afficher les actions"]');
        await click('[aria-label="Actions"]>*:first-child');
        await typeIn('#studentNumber', '1234');
        await click('button[type=submit]');

        // then
        assert.contains('1234');
      });

      test('it should not update the student number if exists', async function(assert) {
        // given
        await visit('/etudiants');

        // when
        await click('[aria-label="Afficher les actions"]');
        await click('[aria-label="Actions"]>*:first-child');
        await typeIn('#studentNumber', '321');
        await click('button[type=submit]');

        // then
        assert.contains('123');
      });
    });
  });
});
