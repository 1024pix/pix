import { module, test } from 'qunit';
import { find, currentURL, triggerEvent } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sco Organization Participant List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let organizationId;

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
      // when
      await visit('/eleves');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function (hooks) {
    let user;

    hooks.afterEach(function () {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    module('When organization is not managing students or is not SCO', function (hooks) {
      hooks.beforeEach(async function () {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('should not be accessible', async function (assert) {
        // when
        await visit('/eleves');

        // then
        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
      });
    });

    module('When organization is SCO and managing students', function (hooks) {
      hooks.beforeEach(async function () {
        user = createUserManagingStudents();
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('it should be accessible', async function (assert) {
        // when
        await visit('/eleves');

        // then
        assert.strictEqual(currentURL(), '/eleves');
      });

      module('when admin uploads a file', function (hooks) {
        hooks.beforeEach(async function () {
          user = createUserManagingStudents('ADMIN');
          createPrescriberByUser(user);

          await authenticateSession(user.id);
        });

        test('it should display success message and reload students', async function (assert) {
          // given
          await visit('/eleves');

          const file = new Blob(['foo'], { type: 'valid-file' });

          // when
          const input = find('#students-file-upload');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert.dom('[data-test-notification-message="success"]').hasText('La liste a été importée avec succès.');
          assert.dom('[aria-label="Élève"]').exists({ count: 1 });
          assert.contains('Cover');
          assert.contains('Harry');
        });

        test('it should display an error message when uploading an invalid file', async function (assert) {
          // given
          await visit('/eleves');

          const file = new Blob(['foo'], { type: 'invalid-file' });

          // when
          const input = find('#students-file-upload');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert.dom('[data-test-notification-message="error"]').exists();
        });
      });

      module('when prescriber is looking for students', function (hooks) {
        hooks.beforeEach(async function () {
          organizationId = user.memberships.models.firstObject.organizationId;
          server.create('sco-organization-participant', {
            organizationId,
            firstName: 'Chuck',
            lastName: 'Norris',
            hasEmail: false,
          });
          server.create('sco-organization-participant', {
            organizationId,
            firstName: 'John',
            lastName: 'Rambo',
            hasEmail: true,
          });
        });

        test('it filters by search', async function (assert) {
          // when
          await visit('/eleves');
          await fillByLabel('Recherche sur le nom et prénom', 'Jo');

          // then
          assert.strictEqual(currentURL(), '/eleves?search=Jo');
        });

        test('it should display the students list filtered by connection type', async function (assert) {
          // when
          await visit('/eleves');
          await fillByLabel('Rechercher par méthode de connexion', 'email');

          // then
          assert.strictEqual(currentURL(), '/eleves?connexionType=email');
          assert.contains('Rambo');
          assert.notContains('Norris');
        });

        test('it should paginate the students list', async function (assert) {
          // when
          await visit('/eleves?pageSize=1&pageNumber=1');

          // then
          assert.contains('Norris');
          assert.notContains('Rambo');
        });
      });

      module('when student is associated', function (hooks) {
        hooks.beforeEach(async function () {
          organizationId = user.memberships.models.firstObject.organizationId;

          server.createList('sco-organization-participant', 5, { organizationId });
        });

        module('when student authenticated by username and email', function (hooks) {
          const username = 'firstname.lastname0112';
          const email = 'firstname.lastname0112@example.net';

          hooks.beforeEach(function () {
            server.create('sco-organization-participant', {
              organizationId,
              firstName: 'FirstName',
              lastName: 'LastName',
              username,
              email,
            });
          });

          test('it should open modal and display password reset button', async function (assert) {
            // given
            const screen = await visit('/eleves');

            // when
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');

            // then
            assert.contains('Réinitialiser le mot de passe');
          });

          test('it should display unique password input when reset button is clicked', async function (assert) {
            // given
            const screen = await visit('/eleves');
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');

            // when
            await clickByName('Réinitialiser le mot de passe');
            // then
            assert.dom('#generate-password').doesNotExist();
            assert.dom('#generated-password').exists();
          });

          test('it should open password modal window with email and username value', async function (assert) {
            // given
            const screen = await visit('/eleves');

            // when
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');

            // then
            assert.dom('#username').hasValue(username);
            assert.dom('#email').hasValue(email);
          });
        });

        module('when student authenticated by GAR', function (hooks) {
          hooks.beforeEach(function () {
            server.create('sco-organization-participant', {
              organizationId,
              isAuthenticatedFromGar: true,
            });
          });

          test('it should open password modal window with GAR connexion method', async function (assert) {
            // given
            const screen = await visit('/eleves');

            // when
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');

            // then
            assert.contains('Médiacentre');
            assert.contains('Ajouter une connexion avec un identifiant');
          });

          test('it should display username and unique password when add username button is clicked', async function (assert) {
            // given
            const screen = await visit('/eleves');
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');

            // when
            await clickByName('Ajouter l’identifiant');

            // then
            assert.contains('Médiacentre');
            assert.contains('Identifiant');
            assert.contains('Nouveau mot de passe à usage unique');
            assert.dom('#username').exist;
            assert.dom('#generated-password').exist;
          });
        });

        module('when student authenticated by GAR and username', function (hooks) {
          hooks.beforeEach(function () {
            server.create('sco-organization-participant', {
              organizationId,
              isAuthenticatedFromGar: true,
              username: 'user.gar3011',
            });
          });

          test('it should open password modal window with GAR and username connexion method', async function (assert) {
            // given
            const screen = await visit('/eleves');

            // when
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');
            // then
            assert.contains('Médiacentre');
            assert.contains('Identifiant');
          });

          test('it should open pasword modal and display password reset button', async function (assert) {
            // given
            const screen = await visit('/eleves');

            // when
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');
            // then
            assert.contains('Réinitialiser le mot de passe');
          });

          test('it should open password modal and display unique password when reset button is clicked', async function (assert) {
            // given
            const screen = await visit('/eleves');
            await clickByName('Afficher les actions');
            await clickByName('Gérer le compte');

            await screen.findByRole('dialog');
            // when
            await clickByName('Réinitialiser le mot de passe');

            // then
            assert.dom('#generate-password').doesNotExist();
            assert.dom('#generated-password').exists();
          });
        });
      });
    });
  });
});
