import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CertificationEligibility from 'mon-pix/components/certifications/dashboard/eligibility';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Dashboard | Eligibility', function (hooks) {
  setupIntlRenderingTest(hooks);
  module('step1', function () {
    module('When user is not certifiable', function () {
      test('should display eligibility card with correct informations', async function (assert) {
        const userEligibility = {
          isCertifiable: false,
          certifiableCompetencesCount: 0,
          minimumCertifiableCompetencesForCertificability: 5,
        };
        const screen = await renderScreen(
        <template><CertificationEligibility @userEligibility={{userEligibility}} /></template>,
        );

        assert
          .dom(
            screen.getByText(
              t('pages.certification-dashboard.eligibility.steps.1.progress.counter', {
                certifiableCompetencesCount: userEligibility.certifiableCompetencesCount,
                minimumCertifiableCompetencesForCertificability:
                userEligibility.minimumCertifiableCompetencesForCertificability,
              }),
            ),
          )
          .exists();
        assert
          .dom(screen.getByRole('heading', { name: t('pages.certification-dashboard.eligibility.steps.1.title') }))
          .exists();
        assert.dom(screen.getByText(t('pages.certification-dashboard.eligibility.steps.1.description'))).exists();
        assert
          .dom(screen.getByRole('link', { name: t('pages.certification-dashboard.eligibility.steps.1.link') }))
          .hasAttribute('href', '/competences');
      });
    });

    module('When user is certifiable', function () {
      test('certifiableCompetencesCount should be caped', async function (assert) {
        const userEligibility = {
          isCertifiable: true,
          certifiableCompetencesCount: 16,
          minimumCertifiableCompetencesForCertificability: 5,
        };
        const screen = await renderScreen(
        <template><CertificationEligibility @userEligibility={{userEligibility}} /></template>,
        );
        assert
          .dom(
            screen.getByText(
              t('pages.certification-dashboard.eligibility.steps.1.progress.counter', {
                certifiableCompetencesCount: 5,
                minimumCertifiableCompetencesForCertificability:
                userEligibility.minimumCertifiableCompetencesForCertificability,
              }),
            ),
          )
          .exists();
      });
    });
  });
 module('step2 and step 3', function () {
   test('should display correct informations', async function (assert) {
     // given
     const userEligibility = {
       isCertifiable: false,
       certifiableCompetencesCount: 5,
       minimumCertifiableCompetencesForCertificability: 5,
     };

     // when
     const screen = await renderScreen(
     <template><CertificationEligibility @userEligibility={{userEligibility}} /></template>,
     );
       // then

  assert
    .dom(
      screen.getByRole(
        'heading',
        {
          name: t('pages.certification-dashboard.eligibility.steps.2.title'),
          level: 3
        }
      )
    ).exists();
  assert.dom(screen.getByRole('heading', { name: t('pages.certification-dashboard.eligibility.steps.3.title'), level: 3 })).exists();
  assert.dom(screen.getByText(t('pages.certification-dashboard.eligibility.steps.2.description'))).exists();
  assert.dom(screen.getByText(t('pages.certification-dashboard.eligibility.steps.3.description'))).exists();

   });
 });
});
