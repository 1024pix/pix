import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { FINALIZED, PROCESSED } from 'pix-admin/models/session';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import sinon from 'sinon';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Session pages', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/session');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    let session;

    hooks.beforeEach(async () => {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      session = server.create('session', {
        id: 1,
        certificationCenterName: 'Centre des Staranne',
        certificationCenterId: 1234,
        status: FINALIZED,
        finalizedAt: new Date('2020-01-01'),
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
        assert.strictEqual(currentURL(), '/sessions/1');
      });

      module('Search section', function () {
        test('it should show a header with title and sessionId search', async function (assert) {
          // when
          const screen = await visit('/sessions/1');

          // then
          assert.dom(screen.getByRole('heading', { name: 'Sessions de certification' })).exists();
          assert.dom(screen.getByRole('textbox', { name: 'Rechercher une session avec un identifiant' })).hasValue('1');
        });

        test('it loads new session when user give a new sessionId', async function (assert) {
          // when
          const screen = await visit('/sessions/1');
          await fillByLabel('Rechercher une session avec un identifiant', '2');
          await clickByName('Informations');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Rechercher une session avec un identifiant' })).hasValue('2');
          assert.dom(screen.getByRole('button', { name: 'Charger' })).exists();
          assert.strictEqual(currentURL(), '/sessions/1');
        });
      });

      module('Tabs section', function () {
        test('tab "Informations" is clickable', async function (assert) {
          // when
          const screen = await visit('/sessions/1');
          await clickByName('Informations');

          // then
          assert.dom(screen.getByRole('link', { name: 'Informations' })).exists();
          assert.strictEqual(currentURL(), '/sessions/1');
        });

        test('tab "Certifications" is clickable', async function (assert) {
          // when
          const screen = await visit('/sessions/1');
          await click(screen.getByLabelText('Liste des certifications de la session'));

          // then
          assert.dom(screen.getByRole('heading', { name: 'Certifications' })).exists();
          assert.strictEqual(currentURL(), '/sessions/1/certifications');
        });
      });

      module('Informations section', function () {
        test('it shows session information', async function (assert) {
          // when
          const screen = await visit('/sessions/1');

          // then
          assert.dom(screen.getByRole('link', { name: session.certificationCenterName })).exists();
          assert.dom(screen.getByText('01/01/2020')).exists();
          assert.dom(screen.getByText(session.examinerGlobalComment)).exists();
        });

        test('it displays a link to a certification center and redirects to it', async function (assert) {
          // given
          server.create('certification-center', { id: 1234 });

          // when
          await clickByName(session.certificationCenterName);

          // then
          assert.strictEqual(currentURL(), '/certification-centers/1234');
        });
      });

      module('Buttons section', function () {
        module('When the session has not been published', function () {
          test('it show the disabled certificates download button', async function (assert) {
            // given
            this.server.create('session');

            // when
            const screen = await visit('/sessions/2');

            // then
            assert.dom(screen.getByRole('button', { name: 'Télécharger les attestations' })).hasAttribute('disabled');
          });
        });

        module('When the session has been published', function () {
          test('it shows the certificates download button', async function (assert) {
            // given
            this.server.create('session', {
              id: 2,
              status: PROCESSED,
            });

            // when
            const screen = await visit('/sessions/2');

            // then
            assert
              .dom(screen.getByRole('button', { name: 'Télécharger les attestations' }))
              .doesNotHaveAttribute('disabled');
          });
        });

        test('it shows all buttons', async function (assert) {
          // when
          const screen = await visit('/sessions/1');

          // then
          assert.dom(screen.getByText("M'assigner la session")).exists();
          assert.dom(screen.getByText('Lien de téléchargement des résultats')).exists();
          assert.dom(screen.getByText('Résultats transmis au prescripteur')).exists();
        });

        module('copy link button', function () {
          test("it should copy 'http://link-to-results.fr?lang=fr' in navigator clipboard on click", async function (assert) {
            // given

            // We were unable to access clipboard in test environment so we used a stub
            const writeTextStub = sinon.stub();
            sinon.stub(navigator, 'clipboard').value({ writeText: writeTextStub.returns() });

            // when
            await clickByName('Lien de téléchargement des résultats');

            // then
            assert.ok(writeTextStub.calledWithExactly('http://link-to-results.fr?lang=fr'));
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
          const screen = await visit('/sessions/1/certifications');

          // then
          assert.dom(screen.getByText(juryCertificationSummary.firstName)).exists();
          assert.dom(screen.getByText(juryCertificationSummary.lastName)).exists();
          assert.dom(screen.getByRole('img', { name: 'Certification publiée' })).exists();
        });
      });
    });
  });
});
