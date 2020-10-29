import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createUserAndMembershipAndTermsOfServiceAccepted,
  authenticateSession } from '../helpers/test-init';
import { upload } from 'ember-file-upload/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Candidates', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let session;
  let certificationCenter;

  const validLastName = 'MonNom';
  const validFirstName = 'MonPrenom';
  const validBirthCity = 'MaVille';
  const validBirthProvinceCode = '974';
  const validBirthCountry = 'MonPays';
  const validBirthdate = '01021990';

  hooks.beforeEach(function() {
    server.create('feature-toggle', { id: 0, certifPrescriptionSco: true });
    createSession();
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
      await authenticateSession(user.id);
      server.createList('certification-candidate', 4, { sessionId: session.id, isLinked: false });
    });

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      await visit(`/sessions/${session.id}`);
      
      // when
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show the number of candidates on tab', async function(assert) {
      // when
      await visit(`/sessions/${session.id}`);

      // then
      const candidateTabSelector = '.session-details-controls__navbar-tabs a:nth-of-type(2)';
      const expectedTabContent = 'Candidats (4)';
      const candidateTabElement = document.querySelector(candidateTabSelector);
      assert.equal(candidateTabElement.innerHTML.trim(), expectedTabContent);
    });

    module('candidates list', function() {

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

        module('when user is SCO', function() {

          module('add students list sco', function() {

            test('it should display the list of students for session', async function(assert) {
              // given
              certificationCenter.update({ type: 'SCO' });
              server.createList('student', 10);

              // when
              await visit(`/sessions/${session.id}/candidats`);
              await click('.button.button--link');

              // then
              assert.equal(currentURL(), `/sessions/${session.id}/ajout-eleves`);
              assert.dom('table tbody tr').exists({ count: 10 });
            });
          });
        });

        module('when user is not SCO', function(hooks) {

          hooks.beforeEach(async function() {
            await visit(`/sessions/${session.id}/candidats`);
          });

          module('when candidate data not valid', function() {

            test('it should leave the line up for modification', async function(assert) {
              this.server.post('/sessions/:id/certification-candidates', () => ({
                errors: ['Invalid data'],
              }), 400);
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
            });

            test('it should display notification error', async function(assert) {
              this.server.post('/sessions/:id/certification-candidates', () => ({
                errors: ['Invalid data'],
              }), 400);
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('[data-test-notification-message="error"]').hasText('Une erreur s\'est produite lors de l\'ajout du candidat.');
            });
          });

          module('when candidate data is valid', function() {

            test('it remove the editable line', async function(assert) {
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').doesNotExist();
            });

            test('it should display notification success', async function(assert) {
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('[data-test-notification-message="success"]').hasText('Le candidat a été ajouté avec succès.');
            });

            test('it should add a new candidate entry', async function(assert) {
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('table tbody tr').exists({ count: 5 });
            });
          });
        });
      });

      module('delete candidate', function(hooks) {
        let linkedCertificationCandidate;
        let notLinkedCertificationCandidate;

        hooks.beforeEach(async function() {
          linkedCertificationCandidate = server.create('certification-candidate', { isLinked: true, sessionId: session.id });
          notLinkedCertificationCandidate = server.create('certification-candidate', { isLinked: false, sessionId: session.id });
          await visit(`/sessions/${session.id}/candidats`);
        });

        module('when candidate is linked', function() {

          test('should not remove candidate row', async function(assert) {
            // when
            await click(`[data-test-id="panel-candidate__actions__delete__${linkedCertificationCandidate.id}"]`);

            // then
            assert.dom(`[data-test-id="panel-candidate__lastName__${linkedCertificationCandidate.id}"]`).exists();
          });
        });

        module('when candidate is not linked', function() {

          test('should remove candidate row', async function(assert) {
            // when
            await click(`[data-test-id="panel-candidate__actions__delete__${notLinkedCertificationCandidate.id}"]`);

            // then
            assert.dom(`[data-test-id="panel-candidate__lastName__${notLinkedCertificationCandidate.id}"]`).doesNotExist();
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
        assert.dom('[data-test-notification-message="success"]').hasText('La liste des candidats a été importée avec succès.');
      });

      test('it should display the error message when uploading an invalid file', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], 'invalid-file');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="error"]').hasText('Aucun candidat n’a été importé. Une erreur personnalisée Veuillez modifier votre fichier et l’importer à nouveau.');
      });

      test('it should display a specific error message when importing is forbidden', async function(assert) {
        // given
        await visit(`/sessions/${session.id}/candidats`);
        const file = new File(['foo'], 'forbidden-import');

        // when
        await upload('#upload-attendance-sheet', file);

        // then
        assert.dom('[data-test-notification-message="error"]')
          .hasText('La session a débuté, il n\'est plus possible de modifier la liste des candidats.');
      });

    });

  });

  async function _fillFormWithCorrectData() {
    await _fillCandidateInput('lastName', validLastName);
    await _fillCandidateInput('firstName', validFirstName);
    await _fillCandidateInput('birthCity', validBirthCity);
    await _fillCandidateInput('birthProvinceCode', validBirthProvinceCode);
    await _fillCandidateInput('birthCountry', validBirthCountry);
    await _fillCandidateInput('birthdate', validBirthdate);
  }

  async function _fillCandidateInput(code, value) {
    await fillIn(`[data-test-id="panel-candidate__${code}__add-staging"] > div > input`, value);
  }

  function createSession() {
    ({ user, certificationCenter } = createUserAndMembershipAndTermsOfServiceAccepted());
    session = server.create('session', { certificationCenterId: certificationCenter.id });
  }
});

