import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CampaignCodeForm from 'mon-pix/components/campaign-code-form';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | campaign code form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display component', async function (assert) {
    // given
    // when
    const screen = await render(<template><CampaignCodeForm /></template>);

    // then
    assert.dom(screen.getByText(t('pages.fill-in-campaign-code.description'))).exists();
    assert.dom(screen.getByRole('textbox', { name: `${t('pages.fill-in-campaign-code.label')} *` })).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.fill-in-campaign-code.start') })).exists();
  });

  module('When user is not logged in', function () {
    test('should display the not connected title', async function (assert) {
      // given
      // when
      const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{false}} /></template>);

      // then
      assert
        .dom(screen.getByRole('heading', { name: t('pages.fill-in-campaign-code.first-title-not-connected') }))
        .exists();
    });

    test('should not display the warning message with the disconnect link', async function (assert) {
      // given
      // when
      const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{false}} /></template>);

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('pages.fill-in-campaign-code.warning-message-logout') }))
        .doesNotExist();
    });
  });

  module('When user is logged in', function () {
    module('When user is anonymous', function () {
      test('should display the not connected title', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { firstName: 'Alain', isAnonymous: true });

        // when
        const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{true}} /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('pages.fill-in-campaign-code.first-title-not-connected'),
            }),
          )
          .exists();
      });

      test('should not display the warning message with the disconnect link', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { firstName: 'Alain', isAnonymous: true });

        // when
        const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{false}} /></template>);

        // then
        assert
          .dom(screen.queryByRole('link', { name: t('pages.fill-in-campaign-code.warning-message-logout') }))
          .doesNotExist();
      });
    });

    module('When user is not anonymous', function () {
      test('should display the title with the user firstName', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { firstName: 'Alain', isAnonymous: false });

        // when
        const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{true}} /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('pages.fill-in-campaign-code.first-title-connected', { firstName: 'Alain' }),
            }),
          )
          .exists();
      });

      test('should display the warning message with the disconnect link', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { firstName: 'Alain', lastName: 'Cendy', isAnonymous: false });

        // when
        const screen = await render(<template><CampaignCodeForm @isUserAuthenticatedByPix={{true}} /></template>);

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.fill-in-campaign-code.warning-message', { firstName: 'Alain', lastName: 'Cendy' }),
              { exact: false },
            ),
          )
          .exists();
        assert
          .dom(screen.getByRole('link', { name: t('pages.fill-in-campaign-code.warning-message-logout') }))
          .exists();
      });
    });
  });

  module('error cases', function () {
    module('when campaign code is empty', function () {
      test('displays error message', async function (assert) {
        // given
        const clearErrors = () => {};
        const screen = await render(<template><CampaignCodeForm @clearErrors={{clearErrors}} /></template>);
        await fillIn(screen.getByRole('textbox', { name: `${t('pages.fill-in-campaign-code.label')} *` }), '');

        // when
        await click(screen.getByRole('button', { name: t('pages.fill-in-campaign-code.start') }));

        // then
        assert.dom(screen.getByText(t('pages.fill-in-campaign-code.errors.missing-code'))).exists();
      });
    });
  });
});
