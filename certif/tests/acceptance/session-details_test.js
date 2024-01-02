import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import { visit as visitScreen, visit } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Session Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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
      assert.strictEqual(currentURL(), '/connexion');
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
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should redirect to session list on click on return button', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}`);
      await click(screen.getByRole('link', { name: 'Revenir à la liste des sessions' }));

      // then
      assert.deepEqual(currentURL(), '/sessions/liste');
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
          time: '14:00:00',
          address: '123 rue des peupliers',
          room: 'Salle 101',
          examiner: 'Winston',
          accessCode: 'ABC123',
        });

        // when
        const screen = await visit('/sessions/123');

        // then
        assert.dom(screen.getByRole('heading', { name: 'Session 123', level: 1 })).exists();
        assert.dom(screen.getByText('123 rue des peupliers')).exists();
        assert.dom(screen.getByText('Salle 101')).exists();
        assert.dom(screen.getByText('Winston')).exists();
        assert.dom(screen.getByText('ABC123')).exists();

        assert.dom(screen.getByRole('heading', { name: 'Heure de début (heure locale)', level: 2 })).exists();
        assert.dom(screen.getByText('lundi 18 févr. 2019')).exists();

        assert.dom(screen.getByRole('heading', { name: 'Date', level: 2 })).exists();
        assert.dom(screen.getByText('14:00')).exists();

        assert
          .dom(screen.getByRole('link', { name: "Télécharger le PV d'incident" }))
          .hasAttribute('href', 'https://cloud.pix.fr/s/B76yA8ip9Radej9/download');
        assert.dom(screen.getByRole('button', { name: 'Télécharger le kit surveillant' })).exists();
      });

      test('it should show issue report sheet download button', async function (assert) {
        // given
        const sessionWithCandidates = server.create('session');
        server.createList('certification-candidate', 3, { isLinked: true, sessionId: 1234321 });

        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}`);

        // then
        assert.dom(screen.getByRole('link', { name: "Télécharger le PV d'incident" })).exists();
      });

      test('it should show attendance sheet download button when there is one or more candidate', async function (assert) {
        // given
        const sessionWithCandidates = server.create('session');
        server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });

        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}`);

        // then
        assert.dom(screen.getByRole('link', { name: "Télécharger la feuille d'émargement" })).exists();
      });

      test('it should not show download attendance sheet button where there is no candidate', async function (assert) {
        // given
        const sessionWithoutCandidate = server.create('session');

        // when
        const screen = await visit(`/sessions/${sessionWithoutCandidate.id}`);

        // then
        assert.dom(screen.queryByRole('link', { name: "Télécharger la feuille d'émargement" })).doesNotExist();
      });
    });

    module('when looking at the session details controls', function () {
      module('when session has clea results and session is published', function () {
        test('it should show the clea result download section', async function (assert) {
          // given
          session.update({ publishedAt: '2022-01-01', hasSomeCleaAcquired: true });

          // when
          const screen = await visit(`/sessions/${session.id}`);

          // then
          assert.dom(screen.getByText(this.intl.t('pages.sessions.detail.panel-clea.title'))).exists();
          assert
            .dom(screen.getByRole('button', { name: this.intl.t('pages.sessions.detail.panel-clea.download-button') }))
            .exists();
        });
      });
    });
  });
});
