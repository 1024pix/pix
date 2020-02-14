import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import moment from 'moment';
import { createUserWithMembership } from '../helpers/test-init';
import { CREATED, FINALIZED } from 'pix-certif/models/session';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let sessionFinalized;
  let sessionNotFinalized;

  hooks.beforeEach(function() {
    user = createUserWithMembership();
    sessionFinalized = server.create('session', { status: FINALIZED, date: '2019-02-18', time: '14:00' });
    sessionNotFinalized = server.create('session', { status: CREATED });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit(`/sessions/${sessionFinalized.id}`);

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

    test('it should display session details page', async function(assert) {
      // when
      await visit(`/sessions/${sessionFinalized.id}`);

      // then
      assert.dom('.session-details-header__title').hasText(`Session ${sessionFinalized.id}`);
      assert.dom('.session-details-container .session-details-row:first-child div:nth-child(2) span').hasText(`${sessionFinalized.address}`);
      assert.dom('.session-details-container .session-details-row:first-child div:nth-child(3) span').hasText(`${sessionFinalized.room}`);
      assert.dom('.session-details-container .session-details-row:first-child div:nth-child(4) span').hasText(`${sessionFinalized.examiner}`);
      assert.dom('.session-details-container .session-details-row:first-child div:nth-child(5) span:first-child').hasText(`${sessionFinalized.accessCode}`);
    });

    test('it should display properly formatted date and time related to the session', async function(assert) {
      // when
      await visit(`/sessions/${sessionFinalized.id}`);

      // then
      assert.dom('.session-details-header-datetime__date .content-text').hasText('lundi 18 févr. 2019');
      assert.dom('.session-details-header-datetime__time .content-text').hasText('14:00');
    });

    module('when visiting the candidates tab', function() {
      let sessionWithCandidates;
      let sessionWithImportNotAllowed;
      let candidateInSession;

      hooks.beforeEach(function() {
        sessionWithCandidates = server.create('session');
        candidateInSession = server.create('certification-candidate', { isLinked: false });
        sessionWithCandidates.update({ certificationCandidates : [candidateInSession] });
        sessionWithImportNotAllowed = server.create('session');
        const candidateLinked = server.create('certification-candidate', { isLinked: true });
        sessionWithImportNotAllowed.update({ certificationCandidates : [candidateLinked] });
      });

      test('it should display a download button', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.dom('[data-test-id="attendance_sheet_download_button"]').exists();
        assert.dom('[data-test-id="attendance_sheet_download_button"]').hasText('Télécharger (.ods)');
      });

      test('it should display an upload button', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.dom('[data-test-id="attendance_sheet_upload_button"]').exists();
        assert.dom('[data-test-id="attendance_sheet_upload_button"]').hasText('Importer (.ods)');
      });

      test('it should display the list of certification candidates', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.dom('[data-test-id="panel-candidate__lastName__1"]').hasText(`${candidateInSession.lastName}`);
        assert.dom('[data-test-id="panel-candidate__firstName__1"]').hasText(`${candidateInSession.firstName}`);
        assert.dom('[data-test-id="panel-candidate__birthdate__1"]').hasText(`${moment(candidateInSession.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
        assert.dom('[data-test-id="panel-candidate__birthCity__1"]').hasText(`${candidateInSession.birthCity}`);
        assert.dom('[data-test-id="panel-candidate__birthProvinceCode__1"]').hasText(`${candidateInSession.birthProvinceCode}`);
        assert.dom('[data-test-id="panel-candidate__birthCountry__1"]').hasText(`${candidateInSession.birthCountry}`);
        assert.dom('[data-test-id="panel-candidate__email__1"]').hasText(`${candidateInSession.email}`);
        assert.dom('[data-test-id="panel-candidate__externalId__1"]').hasText(`${candidateInSession.externalId}`);
      });

      test('it should display a sentence when there is no certification candidates yet', async function(assert) {
        // when
        await visit(`/sessions/${sessionFinalized.id}/candidats`);

        // then
        assert.dom('table tbody').doesNotExist();
        assert.dom('.table__empty').hasText('En attente de candidats');
      });

      test('it should display a warning when the import is not allowed', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithImportNotAllowed.id}/candidats`);

        // then
        assert.dom('.panel-actions__warning').hasText(
          'La session a débuté, vous ne pouvez plus importer une liste de candidats.Si vous souhaitez modifier la liste, vous pouvez ajouter un candidat directement dans le tableau ci-dessous.');
      });

      test('it should display a "Ajouter un candidat" button', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithImportNotAllowed.id}/candidats`);

        // then
        assert.dom('.certification-candidates-add-button__text').hasText('Ajouter un candidat');
      });

      module('when adding a candidate in staging for saving', () => {

        test('it should add a new line when we click on "Ajouter un candidat" button', async function(assert) {
          // when
          await visit(`/sessions/${sessionWithImportNotAllowed.id}/candidats`);
          await click('[data-test-id="add-certification-candidate-staging__button"]');

          // then
          assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
        });

        test('it should remove the line when clicking on cancel button', async function(assert) {
          // when
          await visit(`/sessions/${sessionWithImportNotAllowed.id}/candidats`);
          await click('[data-test-id="add-certification-candidate-staging__button"]');

          // then
          assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
          await click('[data-test-id="panel-candidate__action__cancel"]');
          assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').doesNotExist();
        });
      });
    });

    module('when finalize feature is desactivated', function(hooks) {

      hooks.beforeEach(async function() {
        const controller = this.owner.lookup('controller:authenticated.sessions.details.parameters');
        controller.set('isSessionFinalizationActive', false);
      });

      test('it should be accessible for an authenticated user', async function(assert) {
        // when
        await visit(`/sessions/${sessionFinalized.id}`);

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
      });

      test('it should redirect to update page on click on update button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__update-button');

        // then
        assert.equal(currentURL(), `/sessions/${sessionFinalized.id}/modification`);
      });

      test('it should redirect to update page on click on return button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__return-button');

        // then
        assert.equal(currentURL(), '/sessions/liste');
      });

    });

    module('when finalize feature is activated', function(hooks) {

      hooks.beforeEach(async function() {
        const controller = this.owner.lookup('controller:authenticated.sessions.details.parameters');
        controller.set('isSessionFinalizationActive', true);
      });

      test('it should still redirect to update page on click on return button', async function(assert) {
        // given
        await visit(`/sessions/${sessionFinalized.id}`);

        // when
        await click('.session-details-content__return-button');

        // then
        assert.equal(currentURL(), '/sessions/liste');
      });

      module('when the session is not finalized', function() {

        module('when the session has not CREATED', function() {
          test('it should not display the finalize button', async function(assert) {
            // when
            await visit(`/sessions/${sessionNotFinalized.id}`);

            // then
            assert.dom('.session-details-content__finalize-button').doesNotExist();
          });
        });

        module('when the session has CREATED', function() {
          test('it should redirect to finalize page on click on finalize button', async function(assert) {
            // given
            const candidatesWithStartingCertif = server.createList('certification-candidate', 2, { isLinked: true });
            sessionNotFinalized.update({ certificationCandidates: candidatesWithStartingCertif });
            await visit(`/sessions/${sessionNotFinalized.id}`);

            // when
            await click('.session-details-content__finalize-button');

            // then
            assert.equal(currentURL(), `/sessions/${sessionNotFinalized.id}/finalisation`);
          });
        });
      });

      module('when the session is finalized', function() {

        hooks.beforeEach(async function() {
          const candidatesWithStartingCertif = server.createList('certification-candidate', 2, { isLinked: true });
          sessionFinalized.update({ certificationCandidates: candidatesWithStartingCertif });
        });

        test('it should not redirect to finalize page on click on finalize button', async function(assert) {
          // given
          await visit(`/sessions/${sessionFinalized.id}`);

          // when
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionFinalized.id}`);
        });

        test('it should throw an error on visiting /finalisation url', async function(assert) {
          // given
          await visit(`/sessions/${sessionFinalized.id}`);
          const transitionError = new Error('TransitionAborted');

          // then
          assert.rejects(
            visit(`/sessions/${sessionFinalized.id}/finalisation`),
            transitionError,
            'error raised when visiting finalisation route'
          );
        });
      });

    });

  });

});
