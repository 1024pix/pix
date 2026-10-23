import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CertificationsIndex from 'mon-pix/templates/authenticated/certifications/index';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | Authenticated | Certifications | Index', function (hooks) {
  setupIntlRenderingTest(hooks);

  const userEligibility = {
    isCertifiable: false,
    certifiableCompetencesCount: 1,
    minimumCertifiableCompetencesForCertificability: 5,
  };

  module('when user has no certification', function () {
    test('should display the eligibility steps before the user certifications', async function (assert) {
      // given
      const model = { userEligibility, certificationsSummaries: [] };

      // when
      const screen = await render(<template><CertificationsIndex @model={{model}} /></template>);

      // then
      const sectionTitles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent.trim());
      assert.deepEqual(sectionTitles, [
        t('pages.certifications-dashboard.enrolment-banner.not-certifiable.title'),
        t('pages.certifications-dashboard.eligibility.steps.title'),
        t('pages.certifications-dashboard.user-certifications.title'),
      ]);
    });
  });

  module('when user has some certifications', function () {
    test('should display the user certifications before the eligibility steps', async function (assert) {
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
      const model = { userEligibility, certificationsSummaries: [certificateSummary] };

      // when
      const screen = await render(<template><CertificationsIndex @model={{model}} /></template>);

      // then
      const sectionTitles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent.trim());
      assert.deepEqual(sectionTitles, [
        t('pages.certifications-dashboard.enrolment-banner.not-certifiable.title'),
        t('pages.certifications-dashboard.user-certifications.title'),
        t('pages.certifications-dashboard.eligibility.steps.title'),
      ]);
    });
  });
});
