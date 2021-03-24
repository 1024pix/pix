import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted, authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Add Sco Students', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;
  let session;

  hooks.beforeEach(() => {
    server.create('feature-toggle', { id: 0, certifPrescriptionSco: true });
    certificationPointOfContact = createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted('SCO');
    session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', () => {

    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/ajout-eleves`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', (hooks) => {

    hooks.beforeEach(async () => {
      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should be possible to access student add page', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/candidats`);
      await click('.certification-candidates-sco-actions a');

      // then
      assert.equal(currentURL(), `/sessions/${session.id}/ajout-eleves`);
      assert.dom('.add-student__title').hasText('Ajouter des candidats');
    });

    test('it should be possible to return to candidates page', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/ajout-eleves`);
      await click('.add-student__return-to');

      // then
      assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when there are no students', () => {

      test('it should show a empty list', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/ajout-eleves`);

        // then
        assert.dom('.add-student-list').doesNotExist();
      });
    });

    module('when there are some students', () => {

      const rowSelector = '.add-student-list table tbody tr';

      test('it should be possible to filter student list by division', async function(assert) {
        // given
        server.createList('student', 2, { division: '3A', isSelected: false, isEnrolled: false });
        server.create('student', { division: '3B', isSelected: false, isEnrolled: false });
        server.create('student', { division: '2A', isSelected: false, isEnrolled: false });
        server.create('division', { name: '3A' });
        server.create('division', { name: '2A' });
        server.create('division', { name: '3B' });

        // when
        await visit(`/sessions/${session.id}/ajout-eleves`);
        await click('#add-student-list__multi-select');
        await click('#add-student-list__multi-select-3A');

        // then
        const studentRows = document.querySelectorAll(rowSelector);
        assert.equal(studentRows.length, 2);
      });

      module('when there are no enrolled students', () => {
        const DEFAULT_PAGE_SIZE = 50;

        test('it should show first page of students (with default size)', async function(assert) {
          // given
          server.createList('student', DEFAULT_PAGE_SIZE + 2, { isSelected: false, isEnrolled: false });

          // when
          await visit(`/sessions/${session.id}/ajout-eleves`);

          // then
          const allRow = document.querySelectorAll(rowSelector);
          assert.equal(allRow.length, DEFAULT_PAGE_SIZE);
        });

        module('when selecting some students', () => {

          const checkboxSelector = 'button.checkbox';
          const checkboxCheckedSelector = `${checkboxSelector}.checkbox--checked`;

          test('it should be possible to select 3 students', async function(assert) {
            // given
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            await visit(`/sessions/${session.id}/ajout-eleves`);

            // when
            const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
            const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
            const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
            await click(firstCheckbox);
            await click(secondCheckbox);
            await click(thirdCheckbox);

            // then
            const allRow = document.querySelectorAll(rowSelector);
            assert.equal(allRow.length, DEFAULT_PAGE_SIZE);
            const checkboxChecked = document.querySelectorAll(checkboxCheckedSelector);
            assert.equal(checkboxChecked.length, 3);
          });

          test('it should be possible to cancel enrolling students', async function(assert) {
            // given
            server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
            await visit(`/sessions/${session.id}/ajout-eleves`);

            // given
            const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
            await click(checkbox);

            // when
            const cancelButtonSelector = '.bottom-action-bar__actions--cancel-button';
            await click(cancelButtonSelector);

            // then
            assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
          });

          module('when clicking on "Ajout"', () => {
            test('it redirect to previous page', async function(assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              await visit(`/sessions/${session.id}/ajout-eleves`);
              const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
              await click(checkbox);

              // when
              const addButton = document.querySelector('.add-student-list__bottom-action-bar button');
              await click(addButton);

              // then
              assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
            });

            test('it should add students as certification candidates', async function(assert) {
              // given
              server.createList('student', DEFAULT_PAGE_SIZE, { isSelected: false, isEnrolled: false });
              await visit(`/sessions/${session.id}/ajout-eleves`);
              const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
              const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
              const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
              await click(firstCheckbox);
              await click(secondCheckbox);
              await click(thirdCheckbox);
              const detailController = this.owner.lookup('controller:authenticated.sessions.details');

              // when
              const addButton = document.querySelector('.add-student-list__bottom-action-bar button');
              await click(addButton);

              // then
              const certificationCandidates = await detailController.model.certificationCandidates;
              assert.equal(certificationCandidates.length, 3);
            });
          });
        });
      });

      module('when there are enrolled students', (hooks) => {

        const rowSelector = '.add-student-list table tbody tr';
        let sessionWithEnrolledStudent;

        hooks.beforeEach(async () => {
          // given
          sessionWithEnrolledStudent = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
          server.create('student', { isSelected: false, isEnrolled: false });
          const enrolledStudent = server.create('student', { isSelected: false, isEnrolled: true });
          server.create('certification-candidate', { schoolingRegistrationId: enrolledStudent.id, sessionId: sessionWithEnrolledStudent.id });
          await visit(`/sessions/${sessionWithEnrolledStudent.id}/ajout-eleves`);
        });

        test('it should show "1 candidat sélectionné | 2 candidats déjà ajoutés à la session"', async function(assert) {
          // given
          const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
          const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';

          // when
          const checkboxSelector = 'button.checkbox';
          const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
          await click(firstCheckbox);

          // then
          assert.dom(candidatesEnrolledSelector).includesText('1 candidat(s) déjà ajouté(s) à la session');
          assert.dom(candidatesSelectedSelector).includesText('1 candidat(s) sélectionné(s)');
        });

        test('it should be impossible to select enrolled student', async function(assert) {
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

        module('when toggle all click', () => {
          test('it should show "1 candidat sélectionné | 1 candidats déjà ajoutés à la session"', async function(assert) {
            // given
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            const toggleAllCheckBox = '.add-student-list__checker';

            // when
            await click(toggleAllCheckBox);

            // then
            assert.dom(candidatesEnrolledSelector).includesText('1 candidat(s) déjà ajouté(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('1 candidat(s) sélectionné(s)');
          });
        });
      });
    });
  });
});

