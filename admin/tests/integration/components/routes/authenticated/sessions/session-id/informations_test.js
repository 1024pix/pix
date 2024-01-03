import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { statusToDisplayName } from 'pix-admin/models/session';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import dayjs from 'dayjs';

module('Integration | Component | routes/authenticated/sessions/session | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('regardless of session status', function () {
    test('it renders the details page with correct info', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session');

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
      assert.dom(screen.getByText(dayjs(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'))).exists();
      assert.dom(screen.getByText(session.time)).exists();
      assert.dom(screen.getByText(session.description)).exists();
      assert.dom(screen.getByText(session.accessCode)).exists();
      assert.dom(screen.getByText(statusToDisplayName[session.status])).exists();
    });
  });

  module('when the session is created', function () {
    test('it does not render the examinerGlobalComment row or stats', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session', 'created');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByText('Commentaire global :')).doesNotExist();
      assert.dom(screen.queryByText("Nombre d'écrans de fin de test non renseignés :")).doesNotExist();
    });

    test('it does not render the "M\'assigner la session" button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session', 'created');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByRole('button', { name: "M'assigner la session" })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Définaliser la session' })).doesNotExist();
    });
  });

  module('when the session is finalized', function () {
    test('it renders the finalization date', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // when
      assert.dom(screen.getByText('01/04/2022')).exists();
    });

    test('it renders all the stats of the session', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

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
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary({ hasSupervisorAccess: true }, server);

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        assert.dom(screen.queryByText("Nombre d'écrans de fin de test non renseignés")).doesNotExist();
      });
    });

    test('it renders the examinerGlobalComment if any', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.getByText('Commentaire global :')).exists();
      assert.dom(screen.getByText(session.examinerGlobalComment)).exists();
    });

    test('it does not render the examinerGlobalComment row if no comment', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({ examinerGlobalComment: null }, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByText('Commentaire global :')).doesNotExist();
    });

    module('when results have not yet been sent to prescriber', function () {
      test('it should display the button to flag results as sent', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary({ resultsSentToPrescriberAt: null }, server);

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Résultats transmis au prescripteur' })).exists();
      });
    });

    module('when results have been sent to prescriber', function () {
      test('it should not display the button to flag results as sent', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary({ resultsSentToPrescriberAt: new Date() }, server);

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Résultats transmis au prescripteur' })).doesNotExist();
      });
    });

    module('when the session results have been sent to the prescriber', function () {
      test('it renders the resultsSentToPrescriberAt date', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary(
          { resultsSentToPrescriberAt: new Date('2022-02-22') },
          server,
        );

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        assert.dom(screen.getByText('22/02/2022')).exists();
      });
    });

    module('when the session is processed', function () {
      test('it renders the publishedAt date', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary({ publishedAt: new Date('2022-10-20') }, server);

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // when
        assert.dom(screen.getByText('20/10/2022')).exists();
      });
    });

    module('buttons sections', function () {
      module('when user does not have the right to make certif actions', function () {
        test('it does not render the buttons section', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isMetier: true })(server);
          const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

          // when
          const screen = await visit(`/sessions/${session.id}`);

          // then
          assert.dom(screen.queryByText("M'assigner la session")).doesNotExist();
          assert.dom(screen.queryByText('Définaliser la session')).doesNotExist();
          assert.dom(screen.queryByText('Lien de téléchargement des résultats')).doesNotExist();
          assert.dom(screen.queryByText('Résultats transmis au prescripteur')).doesNotExist();
        });
      });
    });

    module('when user has the right to make certif actions', function () {
      test('it renders the buttons section', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: "M'assigner la session" })).exists();
        assert.dom(screen.getByRole('button', { name: 'Définaliser la session' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Lien de téléchargement des résultats' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Résultats transmis au prescripteur' })).exists();
      });
    });
  });
});

function _buildSessionWithTwoJuryCertificationSummary(sessionData, server) {
  const juryCertifSummary1 = server.create('jury-certification-summary', {
    numberOfCertificationIssueReports: 1,
    status: 'validated',
    hasSeenEndTestScreen: false,
  });
  const juryCertifSummary2 = server.create('jury-certification-summary', {
    status: 'validated',
    hasSeenEndTestScreen: true,
  });

  return server.create('session', {
    date: new Date('2022-01-01'),
    status: 'finalized',
    finalizedAt: new Date('2022-04-01'),
    examinerGlobalComment: 'ceci est un commentaire sur les sessions de certification',
    juryCertificationSummaries: [juryCertifSummary1, juryCertifSummary2],
    ...sessionData,
  });
}
