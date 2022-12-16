import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithCustomCenters,
  createAllowedCertificationCenterAccess,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not authenticated', function () {
    test('it should not be accessible', async function (assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is authenticated', function (hooks) {
    let allowedCertificationCenterAccess;

    hooks.beforeEach(async function () {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        id: 123,
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      });

      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit('/sessions/liste');

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should be accessible', async function (assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.strictEqual(currentURL(), '/sessions/liste');
    });

    test('it should show title indicating that the certificationPointOfContact can create a session', async function (assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.page-title').hasText('Créez votre première session de certification');
    });

    module('when some sessions exist', function () {
      test('it should list the sessions', async function (assert) {
        // given
        server.createList('session-summary', 5, { certificationCenterId: 123, date: '2019-01-01' });

        // when
        await visit('/sessions/liste');

        // then
        assert.dom('table tbody tr').exists({ count: 5 });
      });

      test('it should redirect to detail page of clicked session-summary', async function (assert) {
        // given
        server.create('session-summary', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        server.create('session', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        const screen = await visit('/sessions/liste');

        // when
        await click(screen.getByRole('link', { name: 'Session 123' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/123');
      });

      test('it should update message display when selected certif center changes', async function (assert) {
        // given
        const centerManagingStudents = createAllowedCertificationCenterAccess({
          certificationCenterName: 'Centre SCO isM',
          certificationCenterType: 'SCO',
          isRelatedOrganizationManagingStudents: true,
        });
        const centerNotManagingStudents = createAllowedCertificationCenterAccess({
          certificationCenterName: 'Centre SCO isNotM',
          certificationCenterType: 'SCO',
          isRelatedOrganizationManagingStudents: false,
        });
        certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [centerNotManagingStudents, centerManagingStudents],
        });
        await authenticateSession(certificationPointOfContact.id);
        server.create('session-summary', { certificationCenterId: centerManagingStudents.id });

        // when
        await visit('/sessions/liste');
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        // then
        assert.dom('.pix-message').doesNotExist();
      });

      test('it should delete the session of clicked session-summary', async function (assert) {
        // given
        server.create('session-summary', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        server.create('session-summary', {
          id: 456,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-02-02',
          time: '16:00',
        });
        const screen = await visit('/sessions/liste');
        await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));
        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Supprimer la session' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.dom(screen.getByText('La session a été supprimée avec succès.')).exists();
        assert.dom(screen.queryByRole('button', { name: 'Supprimer la session 123' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Supprimer la session 456' })).exists();
      });

      test('it should display an error notification when the session deletion goes wrong', async function (assert) {
        // given
        server.create('session-summary', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        this.server.delete(
          '/sessions/:id',
          () => ({
            errors: [
              {
                status: '400',
                detail: 'Bad request',
              },
            ],
          }),
          400
        );
        const screen = await visit('/sessions/liste');
        await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));
        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Supprimer la session' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.dom(screen.getByText("Une erreur s'est produite lors de la suppression de la session.")).exists();
        assert.dom(screen.getByRole('button', { name: 'Supprimer la session 123' })).exists();
      });

      test('it should display an error notification when the session deletion returns a not found error', async function (assert) {
        // given
        server.create('session-summary', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        this.server.delete(
          '/sessions/:id',
          () => ({
            errors: [
              {
                status: '404',
                detail: 'Session not found',
              },
            ],
          }),
          422
        );
        const screen = await visit('/sessions/liste');
        await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));
        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Supprimer la session' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.dom(screen.getByText("La session que vous tentez de supprimer n'existe pas.")).exists();
        assert.dom(screen.getByRole('button', { name: 'Supprimer la session 123' })).exists();
      });

      test('it should display an error notification when the session deletion returns a conflict error', async function (assert) {
        // given
        server.create('session-summary', {
          id: 123,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        this.server.delete(
          '/sessions/:id',
          () => ({
            errors: [
              {
                status: '409',
                detail: 'La session a déjà commencé',
              },
            ],
          }),
          422
        );
        const screen = await visit('/sessions/liste');
        await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));
        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Supprimer la session' }));

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.dom(screen.getByText('La session a déjà commencé.')).exists();
        assert.dom(screen.getByRole('button', { name: 'Supprimer la session 123' })).exists();
      });

      test('it should redirect to the same page of session list', async function (assert) {
        // given
        server.createList('session-summary', 30, {
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });
        server.create('session', {
          id: 26,
          address: 'Adresse',
          certificationCenterId: 123,
          date: '2020-01-01',
          time: '14:00',
        });

        const screen = await visit('/sessions/liste');
        await click(screen.getByRole('button', { name: 'Aller à la page suivante' }));
        await click(screen.getByRole('link', { name: 'Session 26' }));

        // when
        await click(screen.getByRole('link', { name: 'Retour à la liste des sessions' }));

        // then
        assert.contains('Page 2 / 2');
        assert.strictEqual(currentURL(), '/sessions/liste?pageNumber=2');
      });
    });
  });
});
