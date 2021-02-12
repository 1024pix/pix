import { module, test, only } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import moment from 'moment';
import {
  createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';
import { upload } from 'ember-file-upload/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import config from 'pix-certif/config/environment';

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
    config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = false;
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
        assert.dom('[data-test-id="attendance_sheet_download_button"]').exists();
        assert.dom('[data-test-id="attendance_sheet_download_button"]').hasText('Télécharger (.ods)');
        assert.dom('[data-test-id="attendance_sheet_upload_button"]').exists();
        assert.dom('[data-test-id="attendance_sheet_upload_button"]').hasText('Importer (.ods)');
      });

      test('it should display a sentence when there is no certification candidates yet', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom('table tbody').doesNotExist();
        assert.dom('.table__empty').hasText('En attente de candidats');
      });
    });

    module('when there are few candidats', function() {

      let sessionWithCandidates;
      let candidates;

      hooks.beforeEach(function() {
        sessionWithCandidates = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
        candidates = server.createList('certification-candidate', 3, { sessionId: sessionWithCandidates.id, isLinked: false });
      });

      test('it should display the list of certification candidates', async function(assert) {
        // given
        const aCandidate = candidates[0];

        // when
        await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.dom('table tbody tr').exists({ count: 3 });
        assert.dom(`[data-test-id="panel-candidate__lastName__${aCandidate.id}"]`).hasText(`${aCandidate.lastName}`);
        assert.dom(`[data-test-id="panel-candidate__firstName__${aCandidate.id}"]`).hasText(`${aCandidate.firstName}`);
        assert.dom(`[data-test-id="panel-candidate__birthdate__${aCandidate.id}"]`).hasText(`${moment(aCandidate.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
        assert.dom(`[data-test-id="panel-candidate__birthCity__${aCandidate.id}"]`).hasText(`${aCandidate.birthCity}`);
        assert.dom(`[data-test-id="panel-candidate__birthProvinceCode__${aCandidate.id}"]`).hasText(`${aCandidate.birthProvinceCode}`);
        assert.dom(`[data-test-id="panel-candidate__birthCountry__${aCandidate.id}"]`).hasText(`${aCandidate.birthCountry}`);
        assert.dom(`[data-test-id="panel-candidate__email__${aCandidate.id}"]`).hasText(`${aCandidate.email}`);
        assert.dom(`[data-test-id="panel-candidate__externalId__${aCandidate.id}"]`).hasText(`${aCandidate.externalId}`);
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
          assert.dom('[data-test-notification-message="error"]').hasText('Aucun candidat n’a été importé. Une erreur personnalisée Veuillez télécharger à nouveau le modèle de liste des candidats et l\'importer à nouveau.');
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

    module('prescription sco toogle', function() {
      let session;
      let scocertificationPointOfContact;
      const linkToCandidate = '.session-details-controls__navbar-tabs a:nth-of-type(2)';

      hooks.beforeEach(async () => {
        session = server.create('session');
        scocertificationPointOfContact = createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
      });

      [
        { isFeatureToggleEnabled: false, iscertificationPointOfContactSco: false },
        { isFeatureToggleEnabled: true, iscertificationPointOfContactSco: false },
        { isFeatureToggleEnabled: false, iscertificationPointOfContactSco: true },
        { isFeatureToggleEnabled: true, iscertificationPointOfContactSco: true },
      ].forEach(({ isFeatureToggleEnabled, iscertificationPointOfContactSco }) => {
        module(`when certification prescription sco feature toggle is ${isFeatureToggleEnabled ? 'enabled' : 'disabled'} and the certificationPointOfContact is ${iscertificationPointOfContactSco ? 'SCO' : 'not SCO'}`, () => {

          test('it should redirect to the default candidates detail view', async (assert) => {
            // given
            server.create('feature-toggle', {
              certifPrescriptionSco: isFeatureToggleEnabled,
            });
            const connectedcertificationPointOfContactId = iscertificationPointOfContactSco ? scocertificationPointOfContact.id : certificationPointOfContact.id;
            await authenticateSession(connectedcertificationPointOfContactId);

            // when
            await visit(`/sessions/${session.id}`);
            await click(linkToCandidate);

            // then
            assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
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

  async function _fillCandidateInput(code, value) {
    await fillIn(`[data-test-id="panel-candidate__${code}__add-staging"] > div > input`, value);
  }

});
