import { render as renderScreen } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import CertificationEligibility from 'mon-pix/components/certifications/dashboard/eligibility'

module('Integration | Component | Certifications | Dashboard | Eligibility', function (hooks) {
  let model;
  setupIntlRenderingTest(hooks);



  module('When user is not certificable', function () {
    test('should display eligibility card with correct informations', async function (assert) {
      const userEligibility = {
                  isCertifiable: false,
                  certifiableCompetencesCount: 0,
                  minimumCertifiableCompetencesForCertificability: 5
              }
      const screen = await renderScreen(<template><CertificationEligibility @userEligibility={{userEligibility}} /></template>);

      assert.dom(screen.getByText(t('pages.certification-dashboard.eligibility.steps.1.progress.counter', {
        certifiableCompetencesCount:userEligibility.certifiableCompetencesCount,
        minimumCertifiableCompetencesForCertificability:userEligibility.minimumCertifiableCompetencesForCertificability
      } ))).exists()
      assert.dom(screen.getByRole('heading', {name: t('pages.certification-dashboard.eligibility.steps.1.title')})).exists()
      assert.dom(screen.getByText(t('pages.certification-dashboard.eligibility.steps.1.description'))).exists();
      assert.dom(screen.getByRole('link', {name: t('pages.certification-dashboard.eligibility.steps.1.link')})).hasAttribute('href', '/competences')
    })
  });

});
