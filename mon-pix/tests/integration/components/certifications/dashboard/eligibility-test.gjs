import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CertificationEligibility from 'mon-pix/components/certifications/dashboard/eligibility';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Dashboard | Eligibility', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('eligibiltiy step', function () {
    module('when user is not certifiable', function () {
      test('should display the block with the right amount of competences', async function (assert) {
        // given
        const userIsCertifiable = {
          isCertifiable: false,
          certifiableCompetencesCount: 1,
          minimumCertifiableCompetencesForCertificability: 5,
        };

        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{userIsCertifiable}} /></template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.certifications-dashboard.eligibility.steps.1.progress.counter', { ...userIsCertifiable }),
            ),
          )
          .exists();
        assert
          .dom(screen.getByText(t('pages.certifications-dashboard.eligibility.steps.1.progress.competences')))
          .exists();
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('pages.certifications-dashboard.eligibility.steps.1.title'),
              level: 3,
            }),
          )
          .exists();
        assert.dom(screen.getByText(t('pages.certifications-dashboard.eligibility.steps.1.description'))).exists();
        assert
          .dom(
            screen.getByText(
              t('pages.certifications-dashboard.eligibility.steps.1.progress.alt', { ...userIsCertifiable }),
            ),
          )
          .exists();
        const router = this.owner.lookup('service:router');
        assert
          .dom(screen.getByRole('link', { name: t('pages.certifications-dashboard.eligibility.steps.1.link') }))
          .hasAttribute('href', router.urlFor('authenticated.profile'));
      });
    });

    module('when user is certifiable', function () {
      test('should display the block with the right amount of competences', async function (assert) {
        // given
        const userIsCertifiable = {
          isCertifiable: true,
          certifiableCompetencesCount: 12,
          minimumCertifiableCompetencesForCertificability: 5,
        };

        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{userIsCertifiable}} /></template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.certifications-dashboard.eligibility.steps.1.progress.counter', {
                ...userIsCertifiable,
                certifiableCompetencesCount: userIsCertifiable.minimumCertifiableCompetencesForCertificability,
              }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('pages.certifications-dashboard.eligibility.steps.1.progress.alt', {
                ...userIsCertifiable,
                certifiableCompetencesCount: userIsCertifiable.minimumCertifiableCompetencesForCertificability,
              }),
            ),
          )
          .exists();
      });
    });
  });

  module('evaluation and results steps', function () {
    const activeStepClass = 'certification-dashboard-eligibility-steps__step-item--active';
    const notCertifiableUser = {
      isCertifiable: false,
      certifiableCompetencesCount: 1,
      minimumCertifiableCompetencesForCertificability: 5,
    };
    const certifiableUser = {
      isCertifiable: true,
      certifiableCompetencesCount: 12,
      minimumCertifiableCompetencesForCertificability: 5,
    };

    function getStep(screen, stepNumber) {
      return screen
        .getByRole('heading', {
          name: t(`pages.certifications-dashboard.eligibility.steps.${stepNumber}.title`),
          level: 3,
        })
        .closest('.certification-dashboard-eligibility-steps__step-item');
    }

    test('should display the steps title and description', async function (assert) {
      // when
      const screen = await renderScreen(
        <template><CertificationEligibility @userIsCertifiable={{notCertifiableUser}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.certifications-dashboard.eligibility.steps.2.title'),
            level: 3,
          }),
        )
        .exists();
      assert.dom(screen.getByText(t('pages.certifications-dashboard.eligibility.steps.2.description'))).exists();
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.certifications-dashboard.eligibility.steps.3.title'),
            level: 3,
          }),
        )
        .exists();
      assert.dom(screen.getByText(t('pages.certifications-dashboard.eligibility.steps.3.description'))).exists();
    });

    module('when user is not certifiable', function () {
      test('should not display the steps as active', async function (assert) {
        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{notCertifiableUser}} /></template>,
        );

        // then
        assert.dom(getStep(screen, 2)).doesNotHaveClass(activeStepClass);
        assert.dom(getStep(screen, 3)).doesNotHaveClass(activeStepClass);
      });

      test('should display a disabled link to find a session', async function (assert) {
        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{notCertifiableUser}} /></template>,
        );

        // then
        assert
          .dom(screen.getByRole('link', { name: t('pages.certifications-dashboard.eligibility.steps.2.link') }))
          .hasAttribute('aria-disabled', 'true');
      });
    });

    module('when user is certifiable', function () {
      test('should display the steps as active', async function (assert) {
        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{certifiableUser}} /></template>,
        );

        // then
        assert.dom(getStep(screen, 2)).hasClass(activeStepClass);
        assert.dom(getStep(screen, 3)).hasClass(activeStepClass);
      });

      test('should display an enabled link to find a session', async function (assert) {
        // when
        const screen = await renderScreen(
          <template><CertificationEligibility @userIsCertifiable={{certifiableUser}} /></template>,
        );

        // then
        const link = screen.getByRole('link', { name: t('pages.certifications-dashboard.eligibility.steps.2.link') });
        assert.dom(link).hasAttribute('aria-disabled', 'false');
        assert.dom(link).hasAttribute('href', 'https://pix.org/fr/trouver-une-session');
        assert.dom(link).hasAttribute('target', '_blank');
        assert.dom(link).hasAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});
