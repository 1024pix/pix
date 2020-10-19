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

  let user;
  let sessionFinalized;
  let sessionNotFinalizedWithoutCandidate;

  hooks.beforeEach(function() {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    const aCandidate = server.create('certification-candidate', { firstName: 'Laura', lastName: 'Carray' });
    sessionFinalized = server.create('session', {
      status: FINALIZED,
      date: '2019-02-18',
      time: '14:00',
      certificationCandidates: [ aCandidate ],
    });
    sessionNotFinalizedWithoutCandidate = server.create('session', { status: CREATED });
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
      await authenticateSession(user.id);
    });

    module('when looking at the header', function() {

      test('it should display session details page', async function(assert) {
        // when
        await visit(`/sessions/${sessionFinalized.id}`);

        // then
        assert.dom('.session-details-header__title h1').hasText(`Session ${sessionFinalized.id}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(2) span').hasText(`${sessionFinalized.address}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(3) span').hasText(`${sessionFinalized.room}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(4) span').hasText(`${sessionFinalized.examiner}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(5) span:first-child').hasText(`${sessionFinalized.accessCode}`);
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
          // when
          await visit(`/sessions/${sessionFinalized.id}`);

          // then
          assert.dom('.session-details-header__title .button').hasText('Télécharger le PV');
        });

        test('it should not show download button where there is no candidate', async function(assert) {
          // when
          await visit(`/sessions/${sessionNotFinalizedWithoutCandidate.id}`);

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

        test('it should show download button when there is one or more candidate1', async function(assert) {
          // when
          await visit(`/sessions/${sessionFinalized.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });

        test('it should not show download button where there is no candidate1', async function(assert) {
          // when
          await visit(`/sessions/${sessionNotFinalizedWithoutCandidate.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });
      });
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
      let sessionWithNoCandidates;
      let sessionWithImportNotAllowed;
      let candidateInSession;

      hooks.beforeEach(function() {
        sessionWithCandidates = server.create('session');
        sessionWithNoCandidates = server.create('session');
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
        assert.dom(`[data-test-id="panel-candidate__lastName__${candidateInSession.id}"]`).hasText(`${candidateInSession.lastName}`);
        assert.dom(`[data-test-id="panel-candidate__firstName__${candidateInSession.id}"]`).hasText(`${candidateInSession.firstName}`);
        assert.dom(`[data-test-id="panel-candidate__birthdate__${candidateInSession.id}"]`).hasText(`${moment(candidateInSession.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`);
        assert.dom(`[data-test-id="panel-candidate__birthCity__${candidateInSession.id}"]`).hasText(`${candidateInSession.birthCity}`);
        assert.dom(`[data-test-id="panel-candidate__birthProvinceCode__${candidateInSession.id}"]`).hasText(`${candidateInSession.birthProvinceCode}`);
        assert.dom(`[data-test-id="panel-candidate__birthCountry__${candidateInSession.id}"]`).hasText(`${candidateInSession.birthCountry}`);
        assert.dom(`[data-test-id="panel-candidate__email__${candidateInSession.id}"]`).hasText(`${candidateInSession.email}`);
        assert.dom(`[data-test-id="panel-candidate__externalId__${candidateInSession.id}"]`).hasText(`${candidateInSession.externalId}`);
      });

      test('it should display a sentence when there is no certification candidates yet', async function(assert) {
        // when
        await visit(`/sessions/${sessionWithNoCandidates.id}/candidats`);

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
          await visit(`/sessions/${sessionNotFinalizedWithoutCandidate.id}`);

          // then
          assert.dom('.session-details-content__finalize-button').doesNotExist();
        });
      });

      module('when the session has CREATED', function() {
        test('it should redirect to finalize page on click on finalize button', async function(assert) {
          // given
          const candidatesWithStartingCertif = server.createList('certification-candidate', 2, { isLinked: true });
          sessionNotFinalizedWithoutCandidate.update({ certificationCandidates: candidatesWithStartingCertif });
          await visit(`/sessions/${sessionNotFinalizedWithoutCandidate.id}`);

          // when
          await click('.session-details-content__finalize-button');

          // then
          assert.equal(currentURL(), `/sessions/${sessionNotFinalizedWithoutCandidate.id}/finalisation`);
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
          'error raised when visiting finalisation route',
        );
      });
    });

  });

  module('when visiting the candidates tab', function() {
    let sessionWithCandidates;
    let sessionWithImportNotAllowed;
    let candidateInSession;

    const linkToCandidate = '.session-details-controls__navbar-tabs a:nth-of-type(2)';

    hooks.beforeEach(function() {
      sessionWithCandidates = server.create('session');
      candidateInSession = server.create('certification-candidate', { isLinked: false });
      sessionWithCandidates.update({ certificationCandidates : [candidateInSession] });
      sessionWithImportNotAllowed = server.create('session');
      const candidateLinked = server.create('certification-candidate', { isLinked: true });
      sessionWithImportNotAllowed.update({ certificationCandidates : [candidateLinked] });
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
          const scoUser = createScoUserWithMembershipAndTermsOfServiceAccepted();
          const connectedUserId = isUserSco ? scoUser.id : user.id;
          await authenticateSession(connectedUserId);

          // when
          await visit(`/sessions/${sessionFinalized.id}`);
          await click(linkToCandidate);

          // then
          assert.equal(currentURL(), '/sessions/1/candidats');
        });
      });
    });
  });

});
