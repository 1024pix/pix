import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Add Sco Students', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let allowedCertificationCenterAccess;
  let certificationPointOfContact;
  let session;

  hooks.beforeEach(function () {
    allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
      type: 'SCO',
      isRelatedToManagingStudentsOrganization: true,
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
    server.createList('country', 3);
  });

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // when
      await visit(`/sessions/${session.id}/inscription-eleves`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      allowedCertificationCenterAccess.update({ isAccessBlockedCollege: false });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}/inscription-eleves`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should be possible to access student add page', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/inscription-eleves`);
      assert.dom(screen.getByRole('heading', { name: 'Inscrire des candidats' })).exists();
    });

    test('it should display support external link', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'support.pix.fr Ouverture dans une nouvelle fenêtre' })).exists();
    });

    test('it should be possible to return to candidates page from add student page', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
      await click(screen.getByRole('link', { name: 'Retour à la session' }));

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when there are no students', function () {
      test('it should show a empty list', async function (assert) {
        // when
        const screen = await visitScreen(`/sessions/${session.id}/candidats`);
        await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

        // then
        assert.dom(screen.queryByRole('columnheader', { name: 'Nom' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Prénom' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Classe' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Date de naissance' })).doesNotExist();
      });
    });

    module('when there are some students', function () {
      const rowSelector = '.add-student-list table tbody tr';

      test('it should be possible to filter student list by division', async function (assert) {
        // given
        server.createList('student', 2, { division: '3A', isSelected: false, isEnrolled: false });
        server.create('student', { division: '3B', isSelected: false, isEnrolled: false });
        server.create('student', { division: '2A', isSelected: false, isEnrolled: false });
        server.create('division', { name: '3A' });
        server.create('division', { name: '2A' });
        server.create('division', { name: '3B' });

        // when
        const screen = await visitScreen(`/sessions/${session.id}/candidats`);
        await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
        await click(
          screen.getByRole('textbox', { name: 'Filtrer la liste des élèves en cochant la ou les classes souhaitées' }),
        );
        await screen.findByRole('menu');
        await click(screen.getByRole('checkbox', { name: '3A' }));

        // then
        const studentRowsLength = screen.getAllByRole('row').length;
        assert.strictEqual(studentRowsLength, 3);
      });

      module('when there are no enrolled students', function () {
        const DEFAULT_PAGE_SIZE = 50;

        test('it should show first page of students (with default size)', async function (assert) {
          // given
          server.createList('student', DEFAULT_PAGE_SIZE + 2, { isSelected: false, isEnrolled: false });

          // when
          const screen = await visitScreen(`/sessions/${session.id}/candidats`);
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // then
          const allRowLength = screen.getAllByRole('row').length;
          assert.strictEqual(allRowLength, DEFAULT_PAGE_SIZE + 1);
        });

        module('when selecting some students', function () {
          const checkboxSelector = '.pix-checkbox__input';

          test('it should be possible to select 3 students', async function (assert) {
            // given
            server.create('student', {
              firstName: 'Quentin',
              lastName: 'Lebouquetin',
              division: '3B',
              birthdate: '2000-01-01',
              isSelected: false,
              isEnrolled: false,
            });
            server.create('student', {
              firstName: 'Quentdeux',
              lastName: 'Lemouton',
              division: '3B',
              birthdate: '2000-01-01',
              isSelected: false,
              isEnrolled: false,
            });
            server.create('student', {
              firstName: 'Quenttrois',
              lastName: 'Lecabri',
              division: '3B',
              birthdate: '2000-01-01',
              isSelected: false,
              isEnrolled: false,
            });
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            const screen = await visitScreen(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

            // when
            await click(screen.getByRole('checkbox', { name: 'Sélectionner le candidat Quentin Lebouquetin' }));
            await click(screen.getByRole('checkbox', { name: 'Sélectionner le candidat Quentdeux Lemouton' }));
            await click(screen.getByRole('checkbox', { name: 'Sélectionner le candidat Quenttrois Lecabri' }));

            // then
            const allRowLength = screen.getAllByRole('row').length;
            assert.strictEqual(allRowLength, DEFAULT_PAGE_SIZE + 1);
            const checkboxCheckedLength = screen.getAllByRole('checkbox', { checked: true }).length;
            assert.strictEqual(checkboxCheckedLength, 4);
          });

          test('it should cancel students enrolment', async function (assert) {
            // given
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            const screen = await visitScreen(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

            // given
            const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
            await click(checkbox);

            // when
            await click(screen.getByRole('link', { name: 'Annuler' }));

            // then
            assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
          });

          module('when clicking on "Ajout"', function () {
            test('it redirect to previous page', async function (assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
              const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
              await click(checkbox);

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
            });

            test('it should add students as certification candidates', async function (assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
              const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
              const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
              const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
              await click(firstCheckbox);
              await click(secondCheckbox);
              await click(thirdCheckbox);
              const detailController = this.owner.lookup('controller:authenticated.sessions.details');

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              const certificationCandidates = await detailController.model.certificationCandidates;
              assert.strictEqual(certificationCandidates.length, 3);
            });

            test('it should display confirmation message', async function (assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
              const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
              const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
              const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
              await click(firstCheckbox);
              await click(secondCheckbox);
              await click(thirdCheckbox);

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              assert
                .dom('[data-test-notification-message="success"]')
                .hasText('Le(s) candidat(s) ont été inscrit(s) avec succès.');
            });
          });
        });
      });

      module('when there are enrolled students', function (hooks) {
        let sessionWithEnrolledStudent;

        hooks.beforeEach(async () => {
          // given
          sessionWithEnrolledStudent = server.create('session', {
            certificationCenterId: allowedCertificationCenterAccess.id,
          });
          server.create('student', {
            isSelected: false,
            isEnrolled: false,
            firstName: 'Jean',
            lastName: 'NotEnrolled',
          });
          const enrolledStudent = server.create('student', {
            isSelected: false,
            isEnrolled: true,
            firstName: 'Jean',
            lastName: 'Enrolled',
          });
          server.create('certification-candidate', {
            organizationLearnerId: enrolledStudent.id,
            sessionId: sessionWithEnrolledStudent.id,
          });
        });

        test('it should show label accordingly', async function (assert) {
          // given
          const screen = await visitScreen(`/sessions/${sessionWithEnrolledStudent.id}/candidats`);
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // when
          await click(screen.getByRole('checkbox', { name: 'Sélectionner le candidat Jean NotEnrolled' }));

          // then
          assert.dom(screen.getByText('1 candidat(s) déjà inscrit(s) à la session')).exists();
          assert.dom(screen.getByText('1 candidat(s) sélectionné(s)')).exists();
        });

        test('it should be impossible to select enrolled student', async function (assert) {
          // given
          const screen = await visitScreen(`/sessions/${sessionWithEnrolledStudent.id}/candidats`);

          // when
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // then
          assert
            .dom(screen.getByRole('checkbox', { name: 'Candidat Jean Enrolled sélectionné' }))
            .hasAttribute('disabled');
        });

        module('when toggle all click', function () {
          test('it should still show "1 candidat sélectionné | 1 candidat déjà ajouté à la session"', async function (assert) {
            // given
            const screen = await visitScreen(`/sessions/${sessionWithEnrolledStudent.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

            // when
            await click(screen.getByRole('checkbox', { name: 'Sélectionner tous les candidats de la liste' }));

            // then
            assert.dom(screen.getByText('1 candidat(s) déjà inscrit(s) à la session')).exists();
            assert.dom(screen.getByText('1 candidat(s) sélectionné(s)')).exists();
          });
        });
      });
    });
  });
});
