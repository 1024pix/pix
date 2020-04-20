import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { statusToDisplayName } from 'pix-admin/models/session';
import { createAuthenticateSession, createUser } from 'pix-admin/tests/helpers/test-init';

import moment from 'moment';

module('Integration | Component | routes/authenticated/sessions/session | informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let session;
  let currentUser;

  hooks.beforeEach(async function() {
    currentUser = createUser();
    await createAuthenticateSession({ userId: currentUser.id });
  });

  module('regardless of session status', function() {

    test('it renders the details page with correct info', async function(assert) {
      // given
      session = this.server.create('session');

      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.equal(currentURL(), `/sessions/${session.id}`);
      assert.dom('.session-info__details div:nth-child(1) div:last-child').hasText(session.certificationCenterName);
      assert.dom('.session-info__details div:nth-child(2) div:last-child').hasText(session.address);
      assert.dom('.session-info__details div:nth-child(3) div:last-child').hasText(session.room);
      assert.dom('.session-info__details div:nth-child(4) div:last-child').hasText(session.examiner);
      assert.dom('.session-info__details div:nth-child(5) div:last-child').hasText(moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
      assert.dom('.session-info__details div:nth-child(6) div:last-child').hasText(session.time);
      assert.dom('.session-info__details div:nth-child(7) div:last-child').hasText(session.description);
      assert.dom('.session-info__details div:nth-child(8) div:last-child').hasText(session.accessCode);
      assert.dom('.session-info__details div:nth-child(9) div:last-child').hasText(statusToDisplayName[session.status]);
    });

  });

  module('when the session is created', function() {

    test('it does not render the examinerGlobalComment row or stats', async function(assert) {
      // given
      session = this.server.create('session', 'created');

      // when
      await visit(`/sessions/${session.id}`);

      assert.equal(find('[data-test-id="session-info__examiner-comment"]'), undefined);
      assert.equal(find('[data-test-id="session-info__number-of-not-checked-end-screen"]'), undefined);
      const firstButton = this.element.querySelector('.session-info__actions .row button:nth-child(1)');
      assert.equal(firstButton.innerHTML.trim(), 'Récupérer le fichier avant jury');
    });
  });

  module('when the session is finalized', function() {

    hooks.beforeEach(async function() {
      const sessionData = {
        status: 'finalized',
        finalizedAt: new Date(),
        examinerGlobalComment: 'commentaire',
        resultsSentToPrescriberAt: new Date(),
      };
      session = this.server.create('session', sessionData);
      const certif1 = this.server.create('certification', { sessionId: session.id, examinerComment: 'ok', status: 'validated', hasSeenEndTestScreen: 'false' });
      const certif2 = this.server.create('certification', { sessionId: session.id, status: 'validated', hasSeenEndTestScreen: 'true' });
      session.update({ certifications: [certif1, certif2] });
    });

    test('it renders the finalization date', async function(assert) {
      // when
      await visit(`/sessions/${session.id}`);

      // when
      assert.dom('[data-test-id="session-info__finalized-at"]').exists();
    });

    test('it renders all the stats of the session', async function(assert) {
      // when
      await visit(`/sessions/${session.id}`);

      // when
      assert.dom('[data-test-id="session-info__number-of-report"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-not-checked-end-screen"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-not-ended-certifications"]').hasText('0');
    });

    test('it renders the examinerGlobalComment if any', async function(assert) {
      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.dom('[data-test-id="session-info__examiner-global-comment"]').hasText(session.examinerGlobalComment);
    });

    test('it does not render the examinerGlobalComment row if no comment', async function(assert) {
      // given
      session.update({ examinerGlobalComment: null });

      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.equal(find('[data-test-id="session-info__examiner-comment"]'), undefined);
    });
    
    module('when results have not yet been sent to prescriber', function() {
      test('it should display the button to flag results as sent', async function(assert) {
        // given
        session.update({ resultsSentToPrescriberAt: null });

        // when
        await visit(`/sessions/${session.id}`);

        // then
        const buttonSendResultsToCandidates = this.element.querySelector('.session-info__actions .row button:nth-child(4)');
        assert.equal(buttonSendResultsToCandidates.innerHTML.trim(), 'Résultats transmis au prescripteur');
      });
      
    });

    module('when results have been sent to prescriber', function() {
      test('it should not display the button to flag results as sent', async function(assert) {
        // given
        session.update({ resultsSentToPrescriberAt: new Date() });

        // when
        await visit(`/sessions/${session.id}`);

        // then
        assert.dom('.session-info__actions .row button:nth-child(4)').doesNotExist();
      });

    });

    module.only('assignation button section', function() {

      const assignationButtonPath = '.session-info__actions div button:first-child';

      module('when no certification officer is assigned to session', function() {

        test('should show "M\'assigner la session" button', async function(assert) {
          // when
          await visit(`/sessions/${session.id}`);

          // then
          assert.dom(assignationButtonPath).hasText('M\'assigner la session');
        });
      });

      module('when a certification officer is already assigned to session', function() {

        module('when the assigned user is different of the current user', function() {

          test('should show "M\'assigner la session" button too', async function(assert) {
            // given 
            const assignedCertificationOfficer = await this.server.create('user', {
              id: 123,
              firstName: 'George',
              lastName: 'Dupont',
            });
            session.update({ assignedCertificationOfficer });

            // when
            await visit(`/sessions/${session.id}`);

            // then
            assert.dom(assignationButtonPath).hasText('M\'assigner la session');
          });
        });

        module('when the assigned user is the current user', function() {

          test('should show "Vous êtes assigné à cette session" button', async function(assert) {
            // given
            session.update({ assignedCertificationOfficer: currentUser });

            // when
            await visit(`/sessions/${session.id}`);

            // then
            assert.dom(assignationButtonPath).hasText('Vous êtes assigné à cette session');
          });
        });
      });
    });
  });

  module('when the session results have been sent to the prescriber', function() {

    test('it renders the resultsSentToPrescriberAt date', async function(assert) {
      // given
      session.update({ resultsSentToPrescriberAt: new Date() });

      // when
      await visit(`/sessions/${session.id}`);

      // when
      assert.dom('[data-test-id="session-info__sent-to-prescriber-at"]').exists();
    });
  });

  module('when the session is processed', function() {

    test('it renders the publishedAt date', async function(assert) {
      // given
      session.update({ publishedAt: new Date() });

      // when
      await visit(`/sessions/${session.id}`);

      // when
      assert.dom('[data-test-id="session-info__published-at"]').exists();
    });
  });
});
