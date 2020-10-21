import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import moment from 'moment';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createScoUserWithMembershipAndTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {
  
  setupApplicationTest(hooks);
  setupMirage(hooks);
  
  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when user is logged in', function(hooks) {

    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession(user.id);
    });
    
    module('when visiting the candidates tab', function() {

      module('when there is no candidats yet', function() {

        let sessionWithoutCandidates;

        hooks.beforeEach(function() {
          sessionWithoutCandidates = server.create('session');
        });

        test('it should display a download button and upload button', async function(assert) {
          // when
          await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);

          // then
          assert.dom('[data-test-id="attendance_sheet_download_button"]').exists();
          assert.dom('[data-test-id="attendance_sheet_download_button"]').hasText('Télécharger (.ods)');
          assert.dom('[data-test-id="attendance_sheet_upload_button"]').exists();
          assert.dom('[data-test-id="attendance_sheet_upload_button"]').hasText('Importer (.ods)');
        });

        test('it should display a sentence when there is no certification candidates yet', async function(assert) {
          // when
          await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);

          // then
          assert.dom('table tbody').doesNotExist();
          assert.dom('.table__empty').hasText('En attente de candidats');
        });
      });

      module('when there are few candidats', function() {

        let sessionWithCandidates;
        let candidates;

        hooks.beforeEach(function() {
          sessionWithCandidates = server.create('session');
          candidates = server.createList('certification-candidate', 3, { sessionId: sessionWithCandidates.id });
        });

        test('it should display the list of certification candidates', async function(assert) {
          // given
          const aCandidate = candidates[0];

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
      
          // then
          assert.dom(`[data-test-id="panel-candidate__lastName__${aCandidate.id}"]`).hasText(`${aCandidate.lastName}`);
          assert.dom(`[data-test-id="panel-candidate__firstName__${aCandidate.id}"]`).hasText(`${aCandidate.firstName}`);
          assert.dom(`[data-test-id="panel-candidate__birthdate__${aCandidate.id}"]`).hasText(`${moment(aCandidate.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
          assert.dom(`[data-test-id="panel-candidate__birthCity__${aCandidate.id}"]`).hasText(`${aCandidate.birthCity}`);
          assert.dom(`[data-test-id="panel-candidate__birthProvinceCode__${aCandidate.id}"]`).hasText(`${aCandidate.birthProvinceCode}`);
          assert.dom(`[data-test-id="panel-candidate__birthCountry__${aCandidate.id}"]`).hasText(`${aCandidate.birthCountry}`);
          assert.dom(`[data-test-id="panel-candidate__email__${aCandidate.id}"]`).hasText(`${aCandidate.email}`);
          assert.dom(`[data-test-id="panel-candidate__externalId__${aCandidate.id}"]`).hasText(`${aCandidate.externalId}`);
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
        
        module('when adding a candidate in staging for saving', () => {
  
          test('it should add a new line when we click on "Ajouter un candidat" button', async function(assert) {
            // when
            await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
            await click('[data-test-id="add-certification-candidate-staging__button"]');
  
            // then
            assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
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
      });

      module('prescription sco toogle', function() {
        let session;
        let scoUser;
        const linkToCandidate = '.session-details-controls__navbar-tabs a:nth-of-type(2)';

        hooks.beforeEach(async () => {
          session = server.create('session');
          scoUser = createScoUserWithMembershipAndTermsOfServiceAccepted();
        });

        [
          { isFeatureToggleEnabled: false, isUserSco: false },
          { isFeatureToggleEnabled: true, isUserSco: false },
          { isFeatureToggleEnabled: false, isUserSco: true },
          { isFeatureToggleEnabled: true, isUserSco: true },
        ].forEach(({ isFeatureToggleEnabled, isUserSco }) => {
          module(`when certification prescription sco feature toggle is ${isFeatureToggleEnabled ? 'enabled' : 'disabled'} and the user is ${isUserSco ? 'SCO' : 'not SCO'}`, () => {
      
            test('it should redirect to the default candidates detail view', async (assert) => {
              // given
              server.create('feature-toggle', {
                certifPrescriptionSco: isFeatureToggleEnabled,
              });
              const connectedUserId = isUserSco ? scoUser.id : user.id;
              await authenticateSession(connectedUserId);
      
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
  });
});
