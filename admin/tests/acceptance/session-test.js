import { module, test } from 'qunit';
import { click, fillIn, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { FINALIZED } from 'pix-admin/models/session';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Session pages', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/session');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    let session;

    hooks.beforeEach(async () => {
      // given
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
      session = server.create('session', {
        id: 1,
        certificationCenterName: 'Centre des Staranne',
        status: FINALIZED,
        finalizedAt: new Date('2020-01-01T03:00:00Z'),
        examinerGlobalComment: 'Commentaire du surveillant',
      });
    });

    module('Informations tab', function(hooks) {

      hooks.beforeEach(async () => {
        // when
        await visit('/sessions/1');
      });

      test('it should be accessible for an authenticated user', function(assert) {
        // then
        assert.equal(currentURL(), '/sessions/1');
      });

      module('Search section', function() {

        test('it should show a header with title and sessionId search', function(assert) {
          // then
          assert.dom('.page-title').hasText('Sessions de certification');
          assert.equal(document.querySelector('.page-actions form input').value, '1');
        });

        test('it loads new session when user give a new sessionId', async  function(assert) {
          // when
          const sessionIdInput = document.querySelector('.page-actions form input');
          await fillIn(sessionIdInput, '2');
          await click('.navbar-item:first-child');

          // then
          assert.equal(sessionIdInput.value, '2');
          assert.dom('.page-actions form button').hasText('Charger');
          assert.equal(currentURL(), '/sessions/1');
        });
      });

      module('Tabs section', function() {

        test('tab "Informations" is clickable', async function(assert) {
          // when
          await click('.navbar-item:first-child');

          // then
          assert.dom('.navbar-item:first-child').hasText('Informations');
          assert.equal(currentURL(), '/sessions/1');
        });

        test('tab "Certifications" is clickable', async function(assert) {
          // when
          await click('.navbar-item:last-child');

          // then
          assert.dom('.navbar-item:last-child').hasText('Certifications');
          assert.equal(currentURL(), '/sessions/1/certifications');
        });
      });

      module('Informations section', function() {

        test('it shows session informations', function(assert) {
          // then
          assert.dom('.session-info__details .row div:last-child').hasText(session.certificationCenterName);
          assert.dom('[data-test-id="session-info__finalized-at"]').hasText(session.finalizedAt.toLocaleString('fr-FR'));
          assert.dom('[data-test-id="session-info__examiner-global-comment"]').hasText(session.examinerGlobalComment);
        });
      });

      module('Buttons section', function() {

        test('it shows all buttons', function(assert) {
          // then
          assert.dom('.session-info__actions div button:first-child').hasText('M\'assigner la session');
          assert.dom('.session-info__actions div button:nth-child(2)').hasText('Récupérer le fichier avant jury');
          assert.dom('.session-info__actions div button:nth-child(3)').hasText('Exporter les résultats');
          assert.dom('.session-info__actions div button:nth-child(4)').hasText('Résultats transmis au prescripteur');
        });
      });
    });

    module('Certifications tab', function(hooks) {

      let juryCertificationSummary;

      hooks.beforeEach(async () => {
        // given
        juryCertificationSummary = server.create('jury-certification-summary', {
          firstName: 'Anne',
          lastName: 'Pix1',
          isPublished: true,
        });
        session.update({ juryCertificationSummaries: [juryCertificationSummary] });

        // when
        await visit('/sessions/1/certifications');
      });

      module('Certification section', function() {

        test('it shows certifications informations', function(assert) {
          // then
          const circle = document.querySelector('.certification-list tbody tr td:last-child div svg circle');
          assert.dom('.certification-list tbody tr td:nth-child(2)').hasText(juryCertificationSummary.firstName);
          assert.dom('.certification-list tbody tr td:nth-child(3)').hasText(juryCertificationSummary.lastName);
          assert.equal(circle.attributes.fill.value, '#39B97A');
        });
      });
    });
  });
});
