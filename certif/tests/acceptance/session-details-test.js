import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import moment from 'moment';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createScoUserWithMembershipAndTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import { CREATED, FINALIZED } from 'pix-certif/models/session';
import config from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {
  
  setupApplicationTest(hooks);
  setupMirage(hooks);
  
  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });
  
  module('when user is not logged in', function() {
    
    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}`);
      
      // then
      assert.equal(currentURL(), '/connexion');
    });
  });
  
  module('when user is logged in', function(hooks) {

    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession(user.id);
    });
    
    test('it should redirect to session list on click on return button', async function(assert) {
      // given
      const session = server.create('session');
      
      // when
      await visit(`/sessions/${session.id}`);
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    module('when looking at the header', function() {

      test('it should display session details', async function(assert) {
        // given
        const session = server.create('session', {
          date: '2019-02-18',
          time: '14:00',
        });

        // when
        await visit(`/sessions/${session.id}`);

        // then
        assert.dom('.session-details-header__title h1').hasText(`Session ${session.id}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(2) span').hasText(`${session.address}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(3) span').hasText(`${session.room}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(4) span').hasText(`${session.examiner}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(5) span:first-child').hasText(`${session.accessCode}`);
        assert.dom('.session-details-header-datetime__date .content-text').hasText('lundi 18 févr. 2019');
        assert.dom('.session-details-header-datetime__time .content-text').hasText('14:00');
      });

      module('when FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE is on', function(hooks) {

        const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

        hooks.before(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = true;
        });

        hooks.after(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
        });

        test('it should show download button when there is one or more candidate', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('.session-details-header__title .button').hasText('Télécharger le PV');
        });

        test('it should not show download button where there is no candidate', async function(assert) {
          // given
          const sessionWithoutCandidate = server.create('session');

          // when
          await visit(`/sessions/${sessionWithoutCandidate.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });
      });

      module('when FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE is off', function(hooks) {

        const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

        hooks.before(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = false;
        });

        hooks.after(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
        });

        test('it should not show download button', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });
      });
    });

    module('when looking at the session details', function() {

      module('when the session is not finalized', function() {

        module('when the session is CREATED', function() {

          test('it should not display the finalize button if no candidat has joined the session', async function(assert) {
            // given
            const sessionCreated = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: false, sessionId: sessionCreated.id });

            // when
            await visit(`/sessions/${sessionCreated.id}`);
    
            // then
            assert.dom('.session-details-content__finalize-button').doesNotExist();
          });

          test('it should redirect to finalize page on click on finalize button', async function(assert) {
            // given
            const sessionCreatedAndStarted = server.create('session', { status: CREATED });
            server.createList('certification-candidate', 2, { isLinked: true, sessionId: sessionCreatedAndStarted.id });

            // when
            await visit(`/sessions/${sessionCreatedAndStarted.id}`);
            await click('.session-details-content__finalize-button');
    
            // then
            assert.equal(currentURL(), `/sessions/${sessionCreatedAndStarted.id}/finalisation`);
          });
        });
      });

      module('when the session is finalized', function(hooks) {

        let sessionFinalized;

        hooks.beforeEach(function() {
          sessionFinalized = server.create('session', { status: FINALIZED });
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionFinalized.id });
        });
    
        test('it should not redirect to finalize page on click on finalize button', async function(assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          await click('.session-details-content__finalize-button');
    
          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
        });

        test('it should throw an error on visiting /finalisation url', async function(assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          const transitionError = new Error('TransitionAborted');
    
          // then
          assert.rejects(
            visit(`/sessions/${sessionFinalized.id}/finalisation`),
            transitionError,
            'error raised when visiting finalisation route',
          );
        });
      });
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
