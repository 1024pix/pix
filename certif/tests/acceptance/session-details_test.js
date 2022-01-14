import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import { visit } from '@1024pix/ember-testing-library';

import config from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // given
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', function (hooks) {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;
    let session;

    hooks.beforeEach(async () => {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
        pixCertifTermsOfServiceAccepted: true,
      });
      session = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}`);

        // then
        assert.equal(currentURL(), '/espace-ferme');
      });
    });

    test('it should redirect to session list on click on return button', async function (assert) {
      // when
      await visit(`/sessions/${session.id}`);
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show the number of candidates on tab', async function (assert) {
      // given
      server.createList('certification-candidate', 4, { sessionId: session.id });

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Candidats (4)' })).exists();
    });

    module('when looking at the header', function () {
      test('it should display session details', async function (assert) {
        // given
        server.create('session', {
          id: 123,
          date: '2019-02-18',
          time: '14:00',
          address: '123 rue des peupliers',
          room: 'Salle 101',
          examiner: 'Winston',
          accessCode: 'ABC123',
        });

        // when
        const screen = await visit('/sessions/123');

        // then
        assert.dom('.session-details-header__title h1').hasText('Session 123');
        assert.dom(screen.getByText('123 rue des peupliers')).exists();
        assert.dom(screen.getByText('Salle 101')).exists();
        assert.dom(screen.getByText('Winston')).exists();
        assert.dom(screen.getByText('ABC123')).exists();
        assert.dom('.session-details-header-datetime__date .content-text').hasText('lundi 18 févr. 2019');
        assert.contains('14:00');
      });

      module('when FT_REPORTS_CATEGORISATION is on', function () {
        test('it should show issue report sheet download button', async function (assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: 1234321 });
          server.create('feature-toggle', { id: 0, reportsCategorization: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('[aria-label="Télécharger le pv d\'incident"]').hasText("PV d'incident\u00a0");
        });
      });

      module('when FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is on', function (hooks) {
        const ft = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

        hooks.before(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = true;
        });

        hooks.after(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = ft;
        });

        test('it should show attendance sheet download button when there is one or more candidate', async function (assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('[aria-label="Télécharger la feuille d\'émargement"]').hasText("Feuille d'émargement\u00a0");
        });

        test('it should not show download attendance sheet button where there is no candidate', async function (assert) {
          // given
          const sessionWithoutCandidate = server.create('session');

          // when
          await visit(`/sessions/${sessionWithoutCandidate.id}`);

          // then
          assert.dom('[aria-label="Télécharger la feuille d\'émargement"]').doesNotExist();
        });
      });

      module('when FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is off', function (hooks) {
        const ft = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

        hooks.before(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = false;
        });

        hooks.after(() => {
          config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = ft;
        });

        test('it should not show download attendance sheet button', async function (assert) {
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
