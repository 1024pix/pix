import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';
import { upload } from 'ember-file-upload/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Candidates', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let session;

  hooks.beforeEach(function() {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
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
      await visit(`/sessions/${session.id}/candidats`);

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

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      await visit(`/sessions/${session.id}`);

      // when
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    module('candidates list', function() {
      let existingCandidates;

      hooks.beforeEach(function() {
        existingCandidates = server.createList('certification-candidate', 4, { isLinked: false });
        session.update({ certificationCandidates : existingCandidates });
      });

      test('it should list the existing candidates in the session', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom('table tbody tr').exists({ count: 4 });
      });

      test('it should replace the candidates list with the imported ones', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], `${session.id}.addTwoCandidates`);

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('table tbody tr').exists({ count: 2 });
      });

      module('add candidate', function() {

        hooks.beforeEach(async function() {
          await visit(`/sessions/${session.id}/candidats`);
        });

        module('when candidate data not valid', function() {

          test('it should leave the line up for modification', async function(assert) {
            this.server.post('/sessions/:id/certification-candidates', () => ({
              errors: [ 'Invalid data' ]
            }), 400);
            // when
            await click('[data-test-id="add-certification-candidate-staging__button"]');
            await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
            await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
            await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
            await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
            await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
            await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
            await click('[data-test-id="panel-candidate__action__save"]');

            // then
            assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
          });

          test('it should display notification error', async function(assert) {
            this.server.post('/sessions/:id/certification-candidates', () => ({
              errors: [ 'Invalid data' ]
            }), 400);
            // when
            await click('[data-test-id="add-certification-candidate-staging__button"]');
            await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
            await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
            await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
            await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
            await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
            await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
            await click('[data-test-id="panel-candidate__action__save"]');

            // then
            assert.dom('[data-test-notification-message="error"]').exists();
          });
        });

        module('when candidate data is valid', function() {

          test('it remove the editable line', async function(assert) {
            // when
            await click('[data-test-id="add-certification-candidate-staging__button"]');
            await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
            await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
            await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
            await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
            await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
            await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
            await click('[data-test-id="panel-candidate__action__save"]');

            // then
            assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').doesNotExist();
          });

          test('it should display notification success', async function(assert) {
            // when
            await click('[data-test-id="add-certification-candidate-staging__button"]');
            await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
            await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
            await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
            await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
            await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
            await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
            await click('[data-test-id="panel-candidate__action__save"]');

            // then
            assert.dom('[data-test-notification-message="success"]').exists();
          });

          test('it should add a new candidate entry', async function(assert) {
            // when
            await click('[data-test-id="add-certification-candidate-staging__button"]');
            await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
            await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
            await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
            await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
            await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
            await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
            await click('[data-test-id="panel-candidate__action__save"]');

            // then
            assert.dom('table tbody tr').exists({ count: 5 });
          });
        });
      });

    });

    module('notifications', function() {

      test('it should display a success message when uploading a valid file', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], 'valid-file');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="success"]').exists();
      });

      test('it should display a generic error message when uploading an invalid file', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], 'invalid-file');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
      });

      test('it should display a specific error message when importing is forbidden', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], 'forbidden-import');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]')
          .hasText('La session a débuté, il n\'est plus possible de modifier la liste des candidats.');
      });

    });

  });

});
