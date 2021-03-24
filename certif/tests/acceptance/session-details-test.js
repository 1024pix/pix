import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import config from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when certificationPointOfContact is not logged in', () => {

    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function(assert) {
      // given
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', (hooks) => {

    let certificationPointOfContact;
    let session;

    hooks.beforeEach(async () => {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should redirect to session list on click on return button', async function(assert) {
      // when
      await visit(`/sessions/${session.id}`);
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show the number of candidates on tab', async function(assert) {
      // given
      server.createList('certification-candidate', 4, { sessionId: session.id });

      // when
      await visit(`/sessions/${session.id}`);

      // then
      const candidateTabSelector = '.session-details-controls__navbar-tabs a:nth-of-type(2)';
      const expectedTabContent = 'Candidats (4)';
      const candidateTabElement = document.querySelector(candidateTabSelector);
      assert.equal(candidateTabElement.innerHTML.trim(), expectedTabContent);
    });

    module('when looking at the header', () => {

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

      module('when FT_REPORTS_CATEGORISATION is on', () => {

        test('it should show issue report sheet download button', async function(assert) {
        // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: 1234321 });
          server.create('feature-toggle', { id: 0, reportsCategorization: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('[aria-label="Télécharger le pv d\'incident"]').hasText('PV d\'incident\u00a0');
        });
      });

      module('when FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is on', (hooks) => {

        const ft = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

        hooks.before(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = true;
        });

        hooks.after(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = ft;
        });

        test('it should show attendance sheet download button when there is one or more candidate', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('[aria-label="Télécharger la feuille d\'émargement"]').hasText('Feuille d\'émargement\u00a0');
        });

        test('it should not show download attendance sheet button where there is no candidate', async function(assert) {
          // given
          const sessionWithoutCandidate = server.create('session');

          // when
          await visit(`/sessions/${sessionWithoutCandidate.id}`);

          // then
          assert.dom('[aria-label="Télécharger la feuille d\'émargement"]').doesNotExist();
        });
      });

      module('when FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is off', (hooks) => {

        const ft = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

        hooks.before(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = false;
        });

        hooks.after(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = ft;
        });

        test('it should not show download attendance sheet button', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('[aria-label="Télécharger la feuille d\'émargement"]').doesNotExist();
        });
      });
    });
  });
});
