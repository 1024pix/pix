import { visit, visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';
import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('when certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // given
      const session = server.create('session-enrolment');
      server.create('session-management', {
        id: session.id,
      });

      // when
      await visit(`/sessions/${session.id}`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', function (hooks) {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;
    let sessionEnrolment;
    let sessionManagement;

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
      sessionEnrolment = server.create('session-enrolment', {
        certificationCenterId: allowedCertificationCenterAccess.id,
      });
      sessionManagement = server.create('session-management', {
        id: sessionEnrolment.id,
      });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${sessionEnrolment.id}`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should redirect to session list on click on return button', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${sessionEnrolment.id}`);
      await click(screen.getByRole('link', { name: 'Revenir à la liste des sessions' }));

      // then
      assert.deepEqual(currentURL(), '/sessions');
    });

    test('it should show the number of candidates on tab', async function (assert) {
      // given
      server.createList('certification-candidate', 4, { sessionId: sessionEnrolment.id });

      // when
      const screen = await visit(`/sessions/${sessionEnrolment.id}`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Candidats (4)' })).exists();
    });

    module('when looking at the header', function () {
      test('it should display session details', async function (assert) {
        // given
        server.create('session-enrolment', {
          id: 123,
          date: '2019-02-18',
          time: '14:00:00',
          address: '123 rue des peupliers',
          room: 'Salle 101',
          examiner: 'Winston',
          accessCode: 'ABC123',
        });
        server.create('session-management', {
          id: 123,
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
        assert.dom(screen.getByRole('button', { name: 'Télécharger le kit surveillant' })).exists();
      });

      module('when session is V2', function () {
        test('it should show the V2 issue report sheet download button', async function (assert) {
          // given
          const sessionWithCandidates = server.create('session-enrolment');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: 1234321 });
          server.create('session-management', {
            id: sessionWithCandidates.id,
            version: 2,
          });

          // when
          const screen = await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert
            .dom(screen.getByRole('link', { name: "Télécharger le PV d'incident" }))
            .hasAttribute('href', 'https://cloud.pix.fr/s/B76yA8ip9Radej9/download');
        });
      });

      module('when session is V3', function () {
        test('it should show the V3 issue report sheet download button', async function (assert) {
          // given
          const sessionWithCandidates = server.create('session-enrolment');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: 1234321 });
          server.create('session-management', {
            id: sessionWithCandidates.id,
            version: 3,
          });

          // when
          const screen = await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert
            .dom(screen.getByRole('link', { name: "Télécharger le PV d'incident" }))
            .hasAttribute('href', 'https://cloud.pix.fr/s/wJc6N3sZNZRC4MZ/download');
        });
      });

      test('it should show attendance sheet download button when there is one or more candidate', async function (assert) {
        // given
        const sessionWithCandidates = server.create('session-enrolment');
        server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });
        server.create('session-management', {
          id: sessionWithCandidates.id,
        });

        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: "Télécharger la feuille d'émargement" })).exists();
      });

      test('it should not show download attendance sheet button where there is no candidate', async function (assert) {
        // given
        const sessionWithoutCandidate = server.create('session-enrolment');
        server.create('session-management', {
          id: sessionWithoutCandidate.id,
        });

        // when
        const screen = await visit(`/sessions/${sessionWithoutCandidate.id}`);

        // then
        assert.dom(screen.queryByRole('button', { name: "Télécharger la feuille d'émargement" })).doesNotExist();
      });
    });

    module('when looking at the session details controls', function () {
      module('when session has clea results and session is published', function () {
        test('it should show the clea result download section', async function (assert) {
          // given
          sessionManagement.update({ publishedAt: '2022-01-01', hasSomeCleaAcquired: true });

          // when
          const screen = await visit(`/sessions/${sessionEnrolment.id}`);

          // then
          assert.dom(screen.getByText(t('pages.sessions.detail.panel-clea.title'))).exists();
          assert
            .dom(screen.getByRole('button', { name: t('pages.sessions.detail.panel-clea.download-button') }))
            .exists();
        });
      });
    });
  });
});
