import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Add Sco Students', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let allowedCertificationCenterAccess;
  let certificationPointOfContact;
  let session;

  hooks.beforeEach(function () {
    server.create('feature-toggle', { id: 0, certifPrescriptionSco: true });
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
      await visit(`/sessions/${session.id}/candidats`);
      await clickByLabel('Inscrire des candidats');

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/inscription-eleves`);
      assert.dom('.add-student__title').hasText('Inscrire des candidats');
    });

    test('it should be possible to return to candidates page from add student page', async function (assert) {
      // when
      await visit(`/sessions/${session.id}/candidats`);
      await clickByLabel('Inscrire des candidats');
      await clickByLabel('Retour à la session');

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when there are no students', function () {
      test('it should show a empty list', async function (assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);
        await clickByLabel('Inscrire des candidats');

        // then
        assert.dom('.add-student-list').doesNotExist();
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
        await visit(`/sessions/${session.id}/candidats`);
        await clickByLabel('Inscrire des candidats');
        await click('.pix-multi-select-header__search-input');
        await clickByLabel('3A');

        // then
        const studentRows = document.querySelectorAll(rowSelector);
        assert.strictEqual(studentRows.length, 2);
      });

      module('when there are no enrolled students', function () {
        const DEFAULT_PAGE_SIZE = 50;

        test('it should show first page of students (with default size)', async function (assert) {
          // given
          server.createList('student', DEFAULT_PAGE_SIZE + 2, { isSelected: false, isEnrolled: false });

          // when
          await visit(`/sessions/${session.id}/candidats`);
          await clickByLabel('Inscrire des candidats');

          // then
          const allRow = document.querySelectorAll(rowSelector);
          assert.strictEqual(allRow.length, DEFAULT_PAGE_SIZE);
        });

        module('when selecting some students', function () {
          const checkboxSelector = 'button.checkbox';
          const checkboxCheckedSelector = `${checkboxSelector}.checkbox--checked`;

          test('it should be possible to select 3 students', async function (assert) {
            // given
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            await visit(`/sessions/${session.id}/candidats`);
            await clickByLabel('Inscrire des candidats');

            // when
            const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
            const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
            const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
            await click(firstCheckbox);
            await click(secondCheckbox);
            await click(thirdCheckbox);

            // then
            const allRow = document.querySelectorAll(rowSelector);
            assert.strictEqual(allRow.length, DEFAULT_PAGE_SIZE);
            const checkboxChecked = document.querySelectorAll(checkboxCheckedSelector);
            assert.strictEqual(checkboxChecked.length, 3);
          });

          test('it should be possible to cancel enrolling students', async function (assert) {
            // given
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            await visit(`/sessions/${session.id}/candidats`);
            await clickByLabel('Inscrire des candidats');

            // given
            const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
            await click(checkbox);

            // when
            await clickByLabel('Annuler');

            // then
            assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
          });

          module('when clicking on "Ajout"', function () {
            test('it redirect to previous page', async function (assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              await visit(`/sessions/${session.id}/candidats`);
              await clickByLabel('Inscrire des candidats');
              const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
              await click(checkbox);

              // when
              await clickByLabel('Inscrire');

              // then
              assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
            });

            test('it should add students as certification candidates', async function (assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              await visit(`/sessions/${session.id}/candidats`);
              await clickByLabel('Inscrire des candidats');
              const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
              const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
              const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
              await click(firstCheckbox);
              await click(secondCheckbox);
              await click(thirdCheckbox);
              const detailController = this.owner.lookup('controller:authenticated.sessions.details');

              // when
              await clickByLabel('Inscrire');

              // then
              const certificationCandidates = await detailController.model.certificationCandidates;
              assert.strictEqual(certificationCandidates.length, 3);
            });
          });
        });
      });

      module('when there are enrolled students', function (hooks) {
        const rowSelector = '.add-student-list table tbody tr';
        let sessionWithEnrolledStudent;

        hooks.beforeEach(async () => {
          // given
          sessionWithEnrolledStudent = server.create('session', {
            certificationCenterId: allowedCertificationCenterAccess.id,
          });
          server.create('student', { isSelected: false, isEnrolled: false });
          const enrolledStudent = server.create('student', { isSelected: false, isEnrolled: true });
          server.create('certification-candidate', {
            schoolingRegistrationId: enrolledStudent.id,
            sessionId: sessionWithEnrolledStudent.id,
          });
          await visit(`/sessions/${sessionWithEnrolledStudent.id}/candidats`);
          await clickByLabel('Inscrire des candidats');
        });

        test('it should show label accordingly', async function (assert) {
          // given
          const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
          const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';

          // when
          const checkboxSelector = 'button.checkbox';
          const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
          await click(firstCheckbox);

          // then
          assert.dom(candidatesEnrolledSelector).includesText('1 candidat(s) déjà inscrit(s) à la session');
          assert.dom(candidatesSelectedSelector).includesText('1 candidat(s) sélectionné(s)');
        });

        test('it should be impossible to select enrolled student', async function (assert) {
          // given
          const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';

          // when
          const checkboxSelector = 'button.checkbox';
          const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
          const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
          await click(firstCheckbox);
          await click(secondCheckbox);

          // then
          assert.dom(candidatesSelectedSelector).includesText('1 candidat(s) sélectionné(s)');
        });

        module('when toggle all click', function () {
          test('it should still show "1 candidat sélectionné | 1 candidat déjà ajouté à la session"', async function (assert) {
            // given
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            const toggleAllCheckBox = '.add-student-list__checker';

            // when
            await click(toggleAllCheckBox);

            // then
            assert.dom(candidatesEnrolledSelector).includesText('1 candidat(s) déjà inscrit(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('1 candidat(s) sélectionné(s)');
          });
        });
      });
    });
  });
});
