import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import UserCertifications from 'mon-pix/components/certifications/dashboard/user-certifications';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Dashboard | User certifications', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the component main title', async function (assert) {
    // given
    const certificationsSummaries = [];

    // when
    const screen = await renderScreen(
      <template><UserCertifications @certificationsSummaries={{certificationsSummaries}} /></template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('heading', { name: t('pages.certifications-dashboard.user-certifications.title'), level: 2 }),
      )
      .exists();
  });

  module('when user has no certification', function () {
    test('should display a specific text', async function (assert) {
      // given
      const certificationsSummaries = [];

      // when
      const screen = await renderScreen(
        <template><UserCertifications @certificationsSummaries={{certificationsSummaries}} /></template>,
      );

      // then
      assert
        .dom(screen.getByText(t('pages.certifications-dashboard.user-certifications.without-certification-text')))
        .exists();
    });
  });

  module('when user has some certifications', function () {
    test('should display a specific text', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 654,
        status: 'WAITING_FOR_RESULTS',
        comment: null,
        verificationCode: null,
        extraCertificationStatus: null,
        certificateType: null,
      });
      const certificationsSummaries = [certificateSummary];

      // when
      const screen = await renderScreen(
        <template><UserCertifications @certificationsSummaries={{certificationsSummaries}} /></template>,
      );

      // then
      assert
        .dom(screen.getByText(t('pages.certifications-dashboard.user-certifications.with-certification-text')))
        .exists();
    });
    test('should display a list of card', async function (assert) {
      const store = this.owner.lookup('service:store');
      const certificationsSummaries = [
        store.createRecord('certificate-summary', {
          id: 2,
          certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
          certificationCenterName: 'Université de Lyon',
          certificationFramework: 'CORE',
          pixScore: 654,
          status: 'WAITING_FOR_RESULTS',
          comment: null,
          verificationCode: null,
          extraCertificationStatus: null,
          certificateType: null,
        }),
        store.createRecord('certificate-summary', {
          id: 32,
          certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
          certificationCenterName: 'Université de Lyon',
          certificationFramework: 'CORE',
          pixScore: 654,
          status: 'WAITING_FOR_RESULTS',
          comment: null,
          verificationCode: null,
          extraCertificationStatus: null,
          certificateType: null,
        }),
      ];

      const screen = await renderScreen(
        <template><UserCertifications @certificationsSummaries={{certificationsSummaries}} /></template>,
      );

      // then
      assert.dom(screen.getByTestId('pw-certification-card-2')).exists();

      assert.dom(screen.getByTestId('pw-certification-card-32')).exists();
    });
  });
});
