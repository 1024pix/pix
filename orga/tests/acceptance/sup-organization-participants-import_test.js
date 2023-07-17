import { module, test } from 'qunit';
import { find, triggerEvent, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sup Student Import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    module('And uploads a file', function () {
      test('it should display success message and reload students', async function (assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'valid-file' });

        // when
        const input = find('#students-file-upload-add');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="success"]').hasText('La liste a été importée avec succès.');
        assert.dom('[data-test-notification-message="warning"]').doesNotExist();

        assert.dom('[aria-label="Étudiant"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
      });

      test('it should display warnings message and reload students', async function (assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'valid-file-with-warnings' });

        // when
        const input = find('#students-file-upload-add');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert
          .dom('[data-test-notification-message="warning"]')
          .hasText(
            'La liste a été importée avec succès.Cependant les valeurs suivantes n’ont pas été reconnues.Diplômes non reconnus : BAD; Elles ont été remplacées par “Non reconnu”. Si vous considérez qu’il manque des valeurs dans la liste limitative, veuillez nous contacter à sup@pix.fr',
          );
        assert.dom('[aria-label="Étudiant"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
      });

      test('it should display an error message when import failed', async function (assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'invalid-file' });

        // when
        const input = find('#students-file-upload-add');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
      });
    });
  });

  module('When member', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('MEMBER', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should redirect to default page', async function (assert) {
      // when
      await visit('/etudiants/import');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });
  });
});
