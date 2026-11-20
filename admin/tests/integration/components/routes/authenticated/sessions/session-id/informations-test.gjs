import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { statusToDisplayName } from 'pix-admin/models/session';
import { FINALIZED } from 'pix-admin/models/session';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/sessions/session | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let intl;

  hooks.beforeEach(function () {
    intl = this.owner.lookup('service:intl');
  });

  module('regardless of session status', function () {
    test('it renders the details page with correct info', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session');
      const sessionDate = intl.formatDate(new Date(session.date));
      const sessionCreatedAt = intl.formatDate(new Date(session.createdAt));

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
      assert.dom(screen.getByText(`${sessionDate} à ${session.time}`)).exists();
      assert.dom(screen.getByText(session.description)).exists();
      assert.dom(screen.getByText(session.accessCode)).exists();
      assert.dom(screen.getByText(statusToDisplayName[session.status])).exists();
      assert.dom(screen.getByText(sessionCreatedAt)).exists();
    });
  });

  module('when the session is created', function () {
    test('it does not render the examinerGlobalComment row or finalization stats', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session', 'created');

      // when
      const screen = await visit(`/sessions/${session.id}`);
      // then
      assert.dom(screen.queryByText(t('pages.sessions.informations.labels.global-comment'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.sessions.informations.labels.impactful-issues'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.sessions.informations.labels.total-issues'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.sessions.informations.labels.scoring-errors'))).doesNotExist();
    });

    test('it does not render the action buttons', async function (assert) {
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

    test('it renders the unfinalize button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = this.server.create('session', { status: FINALIZED, finalizedAt: new Date('2022-04-01') });

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // when
      assert.dom(screen.queryByRole('button', { name: 'Définaliser la session' })).exists();
    });

    test('it renders all the stats of the session', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // when
      assert
        .dom(screen.queryByText(t('pages.sessions.informations.labels.started-certifications')).parentElement)
        .includesText('1');
      assert
        .dom(screen.queryByText(t('pages.sessions.informations.labels.impactful-issues')).parentElement)
        .includesText('2');
      assert
        .dom(screen.queryByText(t('pages.sessions.informations.labels.total-issues')).parentElement)
        .includesText('3');
      assert
        .dom(screen.queryByText(t('pages.sessions.informations.labels.scoring-errors')).parentElement)
        .includesText('4');
    });

    test('it renders the examinerGlobalComment if any', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({}, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.getByText(t('pages.sessions.informations.labels.global-comment'))).exists();
      assert.dom(screen.getByText(session.examinerGlobalComment)).exists();
    });

    test('it does not render the examinerGlobalComment row if no comment', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const session = _buildSessionWithTwoJuryCertificationSummary({ examinerGlobalComment: null }, server);

      // when
      const screen = await visit(`/sessions/${session.id}`);

      // then
      assert.dom(screen.queryByText(t('pages.sessions.informations.labels.global-comment'))).doesNotExist();
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
          const session = this.server.create('session', { status: FINALIZED, finalizedAt: new Date('2022-04-01') });

          // when
          const screen = await visit(`/sessions/${session.id}`);

          // then
          assert.dom(screen.queryByText("M'assigner la session")).doesNotExist();
          assert.dom(screen.queryByText('Définaliser la session')).doesNotExist();
          assert.dom(screen.queryByText('Lien de téléchargement des résultats')).doesNotExist();
        });
      });
    });

    module('when user has the right to make certif actions', function () {
      test('it renders the buttons section', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        const session = this.server.create('session', { status: FINALIZED, finalizedAt: new Date('2022-04-01') });

        // when
        const screen = await visit(`/sessions/${session.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: "M'assigner la session" })).exists();
        assert.dom(screen.getByRole('button', { name: 'Définaliser la session' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Lien de téléchargement des résultats' })).exists();
      });
    });
  });
});

function _buildSessionWithTwoJuryCertificationSummary(sessionData, server) {
  const juryCertifSummary1 = server.create('jury-certification-summary', {
    numberOfCertificationIssueReports: 1,
    status: 'validated',
  });
  const juryCertifSummary2 = server.create('jury-certification-summary', {
    status: 'validated',
  });

  return server.create('session', {
    date: new Date('2022-01-01'),
    status: 'finalized',
    finalizedAt: new Date('2022-04-01'),
    examinerGlobalComment: 'ceci est un commentaire sur les sessions de certification',
    numberOfStartedCertifications: 1,
    totalNumberOfIssueReports: 3,
    numberOfImpactfullIssueReports: 2,
    numberOfScoringErrors: 4,
    juryCertificationSummaries: [juryCertifSummary1, juryCertifSummary2],
    ...sessionData,
  });
}
