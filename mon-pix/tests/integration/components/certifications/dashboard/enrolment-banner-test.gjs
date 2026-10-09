import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import EnrolmentBanner from 'mon-pix/components/certifications/dashboard/enrolment-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { waitForDialogClose } from '../../../../helpers/wait-for';

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

    test('should display the modal when click on action button', async function (assert) {
      // given
      const userEligibility = {
        isCertifiable: true,
      };

      // when
      const screen = await renderScreen(<template><EnrolmentBanner @userEligibility={{userEligibility}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.certifications-dashboard.enrolment-banner.action') }));

      // then
      assert.dom(screen.getByRole('dialog', { name: t('pages.certifications-dashboard.modal.title') })).exists();
      await click(screen.getByRole('button', { name: 'Fermer' }));
      await waitForDialogClose();
      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });

    test("should hide Clea information when user isn't aligible to clea", async function (assert) {
      const userEligibility = {
        isCertifiable: true,
      };

      // when
      const screen = await renderScreen(<template><EnrolmentBanner @userEligibility={{userEligibility}} /></template>);

      // then
      assert
        .dom(
          await screen.queryByRole('heading', {
            name: t('pages.certifications-dashboard.enrolment-banner.clea.title'),
            level: 2,
          }),
        )
        .doesNotExist();
      assert
        .dom(await screen.queryByText(t('pages.certifications-dashboard.enrolment-banner.clea.text')))
        .doesNotExist();
    });
  });

  module('when user is clea certifiable', function () {
    test('should display clea informations', async function (assert) {
      const store = this.owner.lookup('service:store');
      const userEligibility = store.createRecord('is-certifiable', {
        isCertifiable: true,
        doubleCertificationEligibility: { validatedDoubleCertification: true, imageUrl: 'something' },
      });

      // when
      const screen = await renderScreen(<template><EnrolmentBanner @userEligibility={{userEligibility}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.certifications-dashboard.enrolment-banner.clea.title'),
            level: 2,
          }),
        )
        .exists();
      assert.dom(screen.getByText(t('pages.certifications-dashboard.enrolment-banner.clea.text'))).exists();
    });
  });
});
