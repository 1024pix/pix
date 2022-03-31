import { module, test } from 'qunit';
import { click, fillIn, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { FINALIZED } from 'pix-admin/models/session';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Session pages', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/session');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    let session;

    hooks.beforeEach(async () => {
      // given
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
      session = server.create('session', {
        id: 1,
        certificationCenterName: 'Centre des Staranne',
        certificationCenterId: 1234,
        status: FINALIZED,
        finalizedAt: new Date('2020-01-01T03:00:00Z'),
        examinerGlobalComment: 'Commentaire du surveillant',
      });
    });

    module('Informations tab', function (hooks) {
      hooks.beforeEach(async () => {
        // when
        await visit('/sessions/1');
      });

      test('it should be accessible for an authenticated user', function (assert) {
        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/sessions/1');
      });

      module('Search section', function () {
        test('it should show a header with title and sessionId search', function (assert) {
          // then
          assert.dom('.page-title').hasText('Sessions de certification');
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(document.querySelector('.page-actions form input').value, '1');
        });

        test('it loads new session when user give a new sessionId', async function (assert) {
          // when
          const sessionIdInput = document.querySelector('.page-actions form input');
          await fillIn(sessionIdInput, '2');
          await click('.navbar-item:first-child');

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(sessionIdInput.value, '2');
          assert.dom('.page-actions form button').hasText('Charger');
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(currentURL(), '/sessions/1');
        });
      });

      module('Tabs section', function () {
        test('tab "Informations" is clickable', async function (assert) {
          // when
          await click('.navbar-item:first-child');

          // then
          assert.dom('.navbar-item:first-child').hasText('Informations');
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(currentURL(), '/sessions/1');
        });

        test('tab "Certifications" is clickable', async function (assert) {
          // when
          await click('.navbar-item:last-child');

          // then
          assert.dom('.navbar-item:last-child').hasText('Certifications');
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(currentURL(), '/sessions/1/certifications');
        });
      });

      module('Informations section', function () {
        test('it shows session informations', function (assert) {
          // then
          assert.dom('.session-info__details .row div:last-child').hasText(session.certificationCenterName);
          assert.dom('[data-test-id="session-info__finalized-at"]').hasText('01/01/2020');
          assert.dom('[data-test-id="session-info__examiner-global-comment"]').hasText(session.examinerGlobalComment);
        });

        test('it displays a link to a certification center and redirects to it', async function (assert) {
          // given
          server.create('certification-center', { id: 1234 });

          // when
          await clickByName(session.certificationCenterName);

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(currentURL(), '/certification-centers/1234');
        });
      });

      module('Buttons section', function () {
        test('it shows all buttons', async function (assert) {
          // when
          const screen = await visitScreen('/sessions/1');

          // then
          assert.dom(screen.getByText("M'assigner la session")).exists();
          assert.dom(screen.getByText('Lien de téléchargement des résultats')).exists();
          assert.dom(screen.getByText('Résultats transmis au prescripteur')).exists();
        });

        module('copy link button', function () {
          test("it should copy 'http://link-to-results.fr' in navigator clipboard on click", async function (assert) {
            // given

            // We were unable to access clipboard in test environment so we used a stub
            const writeTextStub = sinon.stub();
            sinon.stub(navigator, 'clipboard').value({ writeText: writeTextStub.returns() });

            // when
            await click('.session-info__actions .session-info__copy-button button');

            // then
            assert.ok(writeTextStub.calledWithExactly('http://link-to-results.fr'));
          });
        });
      });
    });

    module('Certifications tab', function () {
      module('Certification section', function () {
        test('it shows certifications information', async function (assert) {
          // given
          const juryCertificationSummary = server.create('jury-certification-summary', {
            firstName: 'Anne',
            lastName: 'Pix1',
            isPublished: true,
          });
          session.update({ juryCertificationSummaries: [juryCertificationSummary] });

          // when
          const screen = await visitScreen('/sessions/1/certifications');

          // then
          assert.dom(screen.getByText(juryCertificationSummary.firstName)).exists();
          assert.dom(screen.getByText(juryCertificationSummary.lastName)).exists();
          assert.dom(screen.getByRole('img', { name: 'Certification publiée' })).exists();
        });
      });
    });
  });
});
