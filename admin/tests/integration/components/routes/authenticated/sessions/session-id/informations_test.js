import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@1024pix/ember-testing-library';
import { statusToDisplayName } from 'pix-admin/models/session';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import moment from 'moment';

module('Integration | Component | routes/authenticated/sessions/session | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let session;

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ role: 'SUPER_ADMIN' })(server);
  });

  module('regardless of session status', function () {
    test('it renders the details page with correct info', async function (assert) {
      // given
      session = this.server.create('session');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}`);

      assert.dom(screen.getByRole('link', { name: session.certificationCenterName })).exists();
      assert
        .dom(screen.getByRole('link', { name: session.certificationCenterName }))
        .hasAttribute('href', '/certification-centers/' + session.certificationCenterId);
      assert.dom(screen.getByText(session.address)).exists();
      assert.dom(screen.getByText(session.room)).exists();
      assert.dom(screen.getByText(session.examiner)).exists();
      assert.dom(screen.getByText(moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'))).exists();
      assert.dom(screen.getByText(session.time)).exists();
      assert.dom(screen.getByText(session.description)).exists();
      assert.dom(screen.getByText(session.accessCode)).exists();
      assert.dom(screen.getByText(statusToDisplayName[session.status])).exists();
    });
  });

  module('when the session is created', function () {
    test('it does not render the examinerGlobalComment row or stats', async function (assert) {
      // given
      session = this.server.create('session', 'created');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByText('Commentaire global :')).doesNotExist();
      assert.dom(screen.queryByText("Nombre d'écrans de fin de test non renseignés :")).doesNotExist();
    });

    test('it does not render the "M\'assigner la session" button', async function (assert) {
      // given
      session = this.server.create('session', 'created');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByRole('button', { name: "M'assigner la session" })).doesNotExist();
    });
  });

  module('when the session is finalized', function (hooks) {
    hooks.beforeEach(async function () {
      const sessionData = {
        status: 'finalized',
        finalizedAt: new Date('2022-01-01'),
        examinerGlobalComment: 'ceci est un commentaire sur les sessions de certification',
        resultsSentToPrescriberAt: new Date('2020-01-01'),
      };
      session = this.server.create('session', sessionData);
      const juryCertifSummary1 = this.server.create('jury-certification-summary', {
        numberOfCertificationIssueReports: 1,
        status: 'validated',
        hasSeenEndTestScreen: false,
      });
      const juryCertifSummary2 = this.server.create('jury-certification-summary', {
        status: 'validated',
        hasSeenEndTestScreen: true,
      });
      session.update({ juryCertificationSummaries: [juryCertifSummary1, juryCertifSummary2] });
    });

    test('it renders the finalization date', async function (assert) {
      // when
      const screen = await visit(`/sessions/${session.id}`);

      // when
      assert.dom(screen.getByText('01/01/2022')).exists();
    });

    test('it renders all the stats of the session', async function (assert) {
      // when
      await visit(`/sessions/${session.id}`);

      // when
      assert.dom('[data-test-id="session-info__number-of-issue-report"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-not-checked-end-screen"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-started-or-error-certifications"]').hasText('0');
    });

    module('when the session has supervisor access', function () {
      test('it should not display the number of not checked end test screens', async function (assert) {
        // given
        session.update({ hasSupervisorAccess: true });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        assert.dom(screen.queryByText("Nombre d'écrans de fin de test non renseignés")).doesNotExist();
      });
    });

    test('it renders the examinerGlobalComment if any', async function (assert) {
      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.getByText('Commentaire global :')).exists();
      assert.dom(screen.getByText(session.examinerGlobalComment)).exists();
    });

    test('it does not render the examinerGlobalComment row if no comment', async function (assert) {
      // given
      session.update({ examinerGlobalComment: null });

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByText('Commentaire global :')).doesNotExist();
    });

    module('when results have not yet been sent to prescriber', function () {
      test('it should display the button to flag results as sent', async function (assert) {
        // given
        session.update({ resultsSentToPrescriberAt: null });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Résultats transmis au prescripteur' })).exists();
      });
    });

    module('when results have been sent to prescriber', function () {
      test('it should not display the button to flag results as sent', async function (assert) {
        // given
        session.update({ resultsSentToPrescriberAt: new Date() });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Résultats transmis au prescripteur' })).doesNotExist();
      });
    });

    module('when the session results have been sent to the prescriber', function () {
      test('it renders the resultsSentToPrescriberAt date', async function (assert) {
        // given
        session.update({ resultsSentToPrescriberAt: new Date('2022-02-22') });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        assert.dom(screen.getByText('22/02/2022')).exists();
      });
    });

    module('when the session is processed', function () {
      test('it renders the publishedAt date', async function (assert) {
        // given
        session.update({ publishedAt: new Date('2022-10-24') });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        console.log(session.publishedAt, 'publish');
        assert.dom(screen.getByText('24/10/2022')).exists();
      });
    });
  });
});
