import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createUserAndMembershipAndTermsOfServiceAccepted, authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Add Students', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let certificationCenter;
  let session;

  hooks.beforeEach(function() {
    server.create('feature-toggle', { id: 0, certifPrescriptionSco: true });
    ({ user, certificationCenter } = createUserAndMembershipAndTermsOfServiceAccepted('SCO'));
    session = server.create('session', { certificationCenterId: certificationCenter.id });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/ajout-eleves`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      await authenticateSession(user.id);
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

    module('when there are no students', function() {

      test('it should show a empty list', async function(assert) {
        // when
        await visit(`/sessions/${session.id}/ajout-eleves`);

        // then
        assert.dom('.add-student-list').doesNotExist();
      });
    });

    module('when there are some students', function(hooks) {

      const rowSelector = '.add-student-list table tbody tr';

      hooks.beforeEach(async () => {
        // given
        server.createList('student', 10, { isSelected: false });
        await visit(`/sessions/${session.id}/ajout-eleves`);
      });

      test('it should show all students', async function(assert) {
        // then
        const allRow = document.querySelectorAll(rowSelector);
        assert.equal(allRow.length, 10);
      });

      module('when selecting some students', function() {

        const checkboxSelector = 'button.checkbox';
        const checkboxCheckedSelector = `${checkboxSelector}.checkbox--checked`;

        test('it should be possible to select 3 students', async function(assert) {
          // when
          const firstCheckbox = document.querySelector(rowSelector + ':nth-child(1) ' + checkboxSelector);
          const secondCheckbox = document.querySelector(rowSelector + ':nth-child(2) ' + checkboxSelector);
          const thirdCheckbox = document.querySelector(rowSelector + ':nth-child(3) ' + checkboxSelector);
          await click(firstCheckbox);
          await click(secondCheckbox);
          await click(thirdCheckbox);

          // then
          const allRow = document.querySelectorAll(rowSelector);
          assert.equal(allRow.length, 10);
          const checkboxChecked = document.querySelectorAll(checkboxCheckedSelector);
          assert.equal(checkboxChecked.length, 3);
        });

        test('it should be possible to cancel enrolling students', async function(assert) {
          // given
          const checkbox = document.querySelector(rowSelector + ' ' + checkboxSelector);
          await click(checkbox);

          // when
          const cancelButtonSelector = '.bottom-action-bar__actions--cancel-button';
          await click(cancelButtonSelector);

          // then
          assert.equal(currentURL(), `/sessions/${session.id}/candidats`);
        });

        module('when clicking on "Ajout"', function() {
          test('it redirect to previous page', async function(assert) {
            // given
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
  
  });
});

