import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setLocale, t } from 'ember-intl/test-support';
import ENV from 'mon-pix/config/environment';
import PixWindow from 'mon-pix/utils/pix-window';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService, stubSessionService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | data-protection-policy-information-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when user is not logged in', function () {
    test('does not display the data protection policy banner', async function (assert) {
      // given
      stubSessionService(this.owner, { isAuthenticated: false });

      // when
      const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
      assert
        .dom(
          screen.queryByRole('link', {
            name: t('common.data-protection-policy-information-banner.url-label'),
          }),
        )
        .doesNotExist();
    });
  });

  module('when user is logged in', function (hooks) {
    hooks.beforeEach(function () {
      stubSessionService(this.owner, { isAuthenticated: true });
    });

    module('when communication banner is displayed', function () {
      test('does not display the data protection policy banner', async function (assert) {
        // given
        _communicationBannerIsDisplayed();
        stubCurrentUserService(this.owner, { shouldSeeDataProtectionPolicyInformationBanner: true });

        // when
        const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
        assert
          .dom(
            screen.queryByRole('link', {
              name: t('common.data-protection-policy-information-banner.url-label'),
            }),
          )
          .doesNotExist();
      });
    });

    module('when communication banner is not displayed', function () {
      module('when user has already seen and accepted the data protection policy update information', function () {
        test('does not display the data protection policy banner', async function (assert) {
          // given
          _communicationBannerIsNotDisplayed();
          stubCurrentUserService(this.owner, { shouldSeeDataProtectionPolicyInformationBanner: false });

          // when
          const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

          // then
          assert.dom(screen.queryByRole('alert')).doesNotExist();
          assert
            .dom(
              screen.queryByRole('link', {
                name: t('common.data-protection-policy-information-banner.url-label'),
              }),
            )
            .doesNotExist();
        });
      });

      module('when user has not seen and accepted the data protection policy update information', function () {
        test('displays the data protection policy banner', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { shouldSeeDataProtectionPolicyInformationBanner: true });
          _stubWindowLocationHostname('pix.fr');
          _communicationBannerIsNotDisplayed();

          // when
          const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

          // then
          assert.dom(screen.getByRole('alert')).exists();
          assert
            .dom(screen.getByRole('link', { name: 'Politique de protection des données.' }))
            .hasAttribute('href', 'https://pix.fr/politique-protection-donnees-personnelles-app');

          const content = screen.getByText((content) =>
            content.startsWith(
              'Notre politique de confidentialité a évolué. Nous vous invitons à en prendre connaissance :',
            ),
          );
          assert.dom(content).exists();
        });

        module('when on international domain (.org)', function () {
          module('when user language is "en"', function () {
            test('displays the data protection policy banner in english', async function (assert) {
              // given
              stubCurrentUserService(this.owner, { shouldSeeDataProtectionPolicyInformationBanner: true });
              _stubWindowLocationHostname('pix.org');
              _communicationBannerIsNotDisplayed();
              setLocale('en');

              // when
              const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

              // then
              assert
                .dom(screen.getByRole('link', { name: 'Personal data protection policy.' }))
                .hasAttribute('href', 'https://pix.org/en/personal-data-protection-policy');

              const content = screen.getByText((content) =>
                content.startsWith(
                  `Please note that our personal data protection policy has been updated. To take a look at what's changing, click here:`,
                ),
              );
              assert.dom(content).exists();
            });
          });

          module('when user language is "nl"', function () {
            test('displays the data protection policy banner in dutch', async function (assert) {
              // given
              stubCurrentUserService(this.owner, { shouldSeeDataProtectionPolicyInformationBanner: true });
              _stubWindowLocationHostname('pix.org');
              _communicationBannerIsNotDisplayed();
              setLocale('nl');

              // when
              const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

              // then
              assert
                .dom(screen.getByRole('link', { name: 'Gegevensbeschermingsbeleid.' }))
                .hasAttribute('href', 'https://pix.org/nl-be/beleid-inzake-de-bescherming-van-persoonsgegevens');

              const content = screen.getByText((content) =>
                content.startsWith('Ons privacybeleid is gewijzigd. Lees het hier:'),
              );
              assert.dom(content).exists();
            });
          });
        });
      });
    });
  });
});

function _communicationBannerIsDisplayed() {
  ENV.APP.BANNER_CONTENT = 'information banner text ...';
  ENV.APP.BANNER_TYPE = 'error';
}

function _communicationBannerIsNotDisplayed() {
  ENV.APP.BANNER_CONTENT = undefined;
  ENV.APP.BANNER_TYPE = undefined;
}

function _stubWindowLocationHostname(hostname) {
  sinon.stub(PixWindow, 'getLocationHostname').returns(hostname);
}
