import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import moment from 'moment';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';
import { upload } from 'ember-file-upload/test-support';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Acceptance | Session Details Certification Candidates', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  const validLastName = 'MonNom';
  const validFirstName = 'MonPrenom';
  const validBirthCity = 'MaVille';
  const validBirthProvinceCode = '974';
  const validBirthCountry = 'MonPays';
  const validBirthdate = '01021990';

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', function() {

    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function(assert) {
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}/candidats`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', function(hooks) {

    let certificationPointOfContact;
    let session;

    hooks.beforeEach(async () => {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      session = server.create('session', { certificationCenterId: certificationPointOfContact.currentCertificationCenterId });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when there is no candidates yet', function() {

      test('it should display a download button and upload button', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.contains('Télécharger (.ods)');
        assert.contains('Importer (.ods)');
      });

      test('it should display a sentence when there is no certification candidates yet', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom('table tbody').doesNotExist();
        assert.contains('En attente de candidats');
      });
    });

    module('when there are some candidates', function(hooks) {

      let sessionWithCandidates;
      let candidates;

      hooks.beforeEach(function() {
        sessionWithCandidates = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
        candidates = server.createList('certification-candidate', 3, { sessionId: sessionWithCandidates.id, isLinked: false, resultRecipientEmail: 'recipient@example.com' });
      });

      module('when the CPF new data feature toggle is off', function() {

        test('it should display the list of certification candidates', async function(assert) {
          // given
          const aCandidate = candidates[0];
          server.create('feature-toggle', { id: 0, isNewCpfDataEnabled: false });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

          // then
          assert.dom('table tbody tr').exists({ count: 3 });

          assert.contains(`${aCandidate.lastName}`);
          assert.contains(`${aCandidate.firstName}`);
          assert.contains(`${moment(aCandidate.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
          assert.contains(`${aCandidate.birthCity}`);
          assert.contains(`${aCandidate.birthProvinceCode}`);
          assert.contains(`${aCandidate.birthCountry}`);
          assert.contains(`${aCandidate.email}`);
          assert.contains(`${aCandidate.resultRecipientEmail}`);
          assert.contains(`${aCandidate.externalId}`);
        });
      });

      module('when the CPF new data feature toggle is on', function() {
        test('it should display details modal button', async function(assert) {
          // given
          server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

          // then
          assert.contains('Voir le détail');
        });

        test('it should display the list of certification candidates ', async function(assert) {
          // given
          const aCandidate = candidates[0];
          server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

          // then
          assert.dom('table tbody tr').exists({ count: 3 });
          assert.dom('table thead tr th').exists({ count: 6 });
          assert.contains(`${aCandidate.lastName}`);
          assert.contains(`${aCandidate.firstName}`);
          assert.contains(`${moment(aCandidate.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
          assert.contains(`${aCandidate.resultRecipientEmail}`);
          assert.contains(`${aCandidate.externalId}`);
        });

        module('when the details button is clicked', function() {
          test('it should display the candidate details modal', async function(assert) {
            // given
            server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });
            const aCandidate = candidates[0];

            // when
            await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
            await clickByLabel(`Voir le détail du candidat ${aCandidate.firstName} ${aCandidate.lastName}`);

            // then
            assert.contains('Détail du candidat');
            assert.contains('Commune de naissance');
            assert.contains(aCandidate.birthCity);
            assert.contains(aCandidate.sex === 'F' ? 'Femme' : 'Homme');
          });
        });
      });

      module('on import', function() {

        test('it should replace the candidates list with the imported ones', async function(assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new File(['foo'], `${sessionWithCandidates.id}.addTwoCandidates`);

          // when
          await upload('#upload-attendance-sheet', file);

          // then
          assert.dom('table tbody tr').exists({ count: 2 });
        });

        test('it should display a success message when uploading a valid file', async function(assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new File(['foo'], 'valid-file');

          // when
          await upload('#upload-attendance-sheet', file);

          // then
          assert.dom('[data-test-notification-message="success"]').hasText('La liste des candidats a été importée avec succès.');
        });

        test('it should display the error message when uploading an invalid file', async function(assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new File(['foo'], 'invalid-file');

          // when
          await upload('#upload-attendance-sheet', file);

          // then
          assert.dom('[data-test-notification-message="error"]').hasText('Aucun candidat n’a été importé. Une erreur personnalisée. Veuillez télécharger à nouveau le modèle de liste des candidats et l\'importer à nouveau.');
        });

        test('it should display the error message when uploading a file with validation error', async function(assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new File(['foo'], 'validation-error');

          // when
          await upload('#upload-attendance-sheet', file);

          // then
          assert.dom('[data-test-notification-message="error"]').hasText('Aucun candidat n’a été importé. Une erreur personnalisée.');
        });

        test('it should display a specific error message when importing is forbidden', async function(assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new File(['foo'], 'forbidden-import');

          // when
          await upload('#upload-attendance-sheet', file);

          // then
          assert.dom('[data-test-notification-message="error"]')
            .hasText('La session a débuté, il n\'est plus possible de modifier la liste des candidats.');
        });

        test('it should display a warning when the import is not allowed', async function(assert) {
          // given
          server.create('certification-candidate', { sessionId: sessionWithCandidates.id, isLinked: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

          // then
          assert.dom('.panel-actions__warning').hasText(
            'La session a débuté, vous ne pouvez plus importer une liste de candidats.Si vous souhaitez modifier la liste, vous pouvez ajouter un candidat directement dans le tableau ci-dessous.');
        });
      });

      module('add candidate', () => {

        module('when certificationPointOfContact is not SCO', function(hooks) {

          hooks.beforeEach(async function() {
            server.create('feature-toggle', { id: 0, certifPrescriptionSco: false });
            await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
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
              // given
              // when
              await click('[data-test-id="add-certification-candidate-staging__button"]');
              await _fillFormWithCorrectData();
              await click('[data-test-id="panel-candidate__action__save"]');

              // then
              assert.dom('table tbody tr').exists({ count: 4 });
            });
          });

          test('it should remove the line when clicking on cancel button', async function(assert) {
            // when
            await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
            await click('[data-test-id="add-certification-candidate-staging__button"]');

            // then
            assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
            await click('[data-test-id="panel-candidate__action__cancel"]');
            assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').doesNotExist();
          });
        });

        module('when certificationPointOfContact is SCO managing students', function() {

          test('it should display the list of students for session', async function(assert) {
            // given
            server.create('feature-toggle', { id: 0, certifPrescriptionSco: true });
            const certificationCenter = server.schema.certificationCenters.findBy({ id: certificationPointOfContact.currentCertificationCenterId });
            certificationCenter.update({ type: 'SCO' });
            certificationCenter.update({ isRelatedOrganizationManagingStudents: true });
            server.createList('student', 10);

            // when
            await visit(`/sessions/${session.id}/candidats`);
            await click('[aria-label="Ajouter des candidats"]');

            // then
            assert.equal(currentURL(), `/sessions/${session.id}/ajout-eleves`);
            assert.dom('table tbody tr').exists({ count: 10 });
          });
        });

      });
    });

    test('it should redirect to the default candidates detail view', async function(assert) {
      // given
      server.create('feature-toggle', {});
      const linkToCandidate = '.session-details-controls__navbar-tabs a:nth-of-type(2)';
      const connectedcertificationPointOfContactId = certificationPointOfContact.id;
      await authenticateSession(connectedcertificationPointOfContactId);

      // when
      await visit(`/sessions/${session.id}`);
      await click(linkToCandidate);

      // then
      assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when the cpfNewDataFeatureToggle is on', function() {
      module('when the addCandidate button is clicked', function() {
        test('it should open the new Certification Candidate Modal', async function(assert) {
          // given
          const sessionWithoutCandidates = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
          server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });
          server.create('country', []);

          // when
          await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);
          await clickByLabel('Ajouter un candidat');

          // then
          assert.contains('Ajouter le candidat');
        });
      });

      module('when the new candidate form is submitted', function() {

        test('it should display the error message when the submitted form data is incorrect', async function(assert) {
          // given
          const session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
          server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });
          server.createList('country', 2, { code: '99100' });

          this.server.post('/sessions/:id/certification-candidates', () => ({
            errors: [{
              status: '422',
              detail: 'An error message',
            }],
          }), 422);

          // when
          await visit(`/sessions/${session.id}/candidats`);
          await clickByLabel('Ajouter un candidat');
          await _fillFormWithCorrectDataForCPF();
          await clickByLabel('Ajouter le candidat');

          // then
          assert.dom('[data-test-notification-message="error"]').hasText('An error message');
        });

        module('when candidate data is valid', function(hooks) {

          hooks.beforeEach(async function() {
            server.create('feature-toggle', { id: 0, isNewCPFDataEnabled: true });
            server.createList('country', 2, { code: '99100' });
            session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
            await visit(`/sessions/${session.id}/candidats`);
          });

          test('it should display a success notification', async function(assert) {
            // when
            await clickByLabel('Ajouter un candidat');
            await _fillFormWithCorrectDataForCPF();
            await clickByLabel('Ajouter le candidat');

            // then
            assert.dom('[data-test-notification-message="success"]').hasText('Le candidat a été ajouté avec succès.');
          });

          test('it should add a new candidate', async function(assert) {
            // given
            // when
            await clickByLabel('Ajouter un candidat');
            await _fillFormWithCorrectDataForCPF();
            await clickByLabel('Ajouter le candidat');

            // then
            assert.dom('table tbody tr').exists({ count: 1 });
          });
        });
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

  async function _fillFormWithCorrectDataForCPF() {
    await fillInByLabel('Prénom', 'Guybrush');
    await fillInByLabel('Nom de famille', 'Threepwood');
    await fillInByLabel('Date de naissance', '28/04/2019');
    await clickByLabel('Homme');
    await fillInByLabel('Pays de naissance', '99100');
    await clickByLabel('Code INSEE');
    await fillInByLabel('Identifiant externe', '44AA3355');
    await fillInByLabel('Code INSEE de naissance', '75100');
    await fillInByLabel('Temps majoré (%)', '20');
    await fillInByLabel('E-mail du destinataire des résultats', 'guybrush.threepwood@example.net');
    await fillInByLabel('E-mail de convocation', 'roooooar@example.net');
  }

  async function _fillCandidateInput(code, value) {
    await fillIn(`[data-test-id="panel-candidate__${code}__add-staging"] > div > input`, value);
  }

});
