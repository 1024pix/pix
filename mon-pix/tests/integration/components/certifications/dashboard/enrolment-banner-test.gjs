import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import EnrolmentBanner from 'mon-pix/components/certifications/dashboard/enrolment-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Dashboard | Enrolment banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is not certifiable', function () {
    test('should display a specific text', async function (assert) {
      // given
      const userEligibility = {
        isCertifiable: false,
      };

      // when
      const screen = await renderScreen(<template><EnrolmentBanner @userEligibility={{userEligibility}} /></template>);
      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.certifications-dashboard.enrolment-banner.not-certifiable.title'),
            level: 2,
          }),
        )
        .exists();
      assert
        .dom(screen.getByText(t('pages.certifications-dashboard.enrolment-banner.not-certifiable.description')))
        .exists();
      assert
        .dom(screen.getByRole('button', { name: t('pages.certifications-dashboard.enrolment-banner.action') }))
        .hasAttribute('aria-disabled', 'true');
    });
  });

  module('when user is certifiable', function () {
    test('should display a specific text', async function (assert) {
      // given
      const userEligibility = {
        isCertifiable: true,
      };

      // when
      const screen = await renderScreen(<template><EnrolmentBanner @userEligibility={{userEligibility}} /></template>);
      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.certifications-dashboard.enrolment-banner.certifiable.title'),
            level: 2,
          }),
        )
        .exists();
      assert
        .dom(screen.getByText(t('pages.certifications-dashboard.enrolment-banner.certifiable.description')))
        .exists();

      assert.notOk(
        screen
          .getByRole('button', { name: t('pages.certifications-dashboard.enrolment-banner.action') })
          .getAttribute('aria-disabled'),
      );
    });
  });
});
