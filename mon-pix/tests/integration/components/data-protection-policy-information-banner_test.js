import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';
import ENV from 'mon-pix/config/environment';

module('Integration | Component | data-protection-policy-information-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is not logged in', function () {
    test('should never display the data protection policy banner', async function (assert) {
      // given
      _userIsNotLoggedIn(this);

      // when
      const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
      assert
        .dom(
          screen.queryByRole('link', {
            name: this.intl.t('common.data-protection-policy-information-banner.url-label'),
          })
        )
        .doesNotExist();
    });
  });

  module('when user is logged in', function () {
    module('when communication banner is displayed', function () {
      test('should never display the data protection policy banner', async function (assert) {
        // given
        _communicationBannerIsDisplayed();
        _userShouldSeeTheDataProtectionPolicyUpdateInformation(this);

        // when
        const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
        assert
          .dom(
            screen.queryByRole('link', {
              name: this.intl.t('common.data-protection-policy-information-banner.url-label'),
            })
          )
          .doesNotExist();
      });
    });

    module('when communication banner is not displayed', function () {
      module('when user should not see the data protection policy update information', function () {
        test('should not display the banner', async function (assert) {
          // given
          _communicationBannerIsNotDisplayed();
          _userShouldNotSeeTheDataProtectionPolicyUpdateInformation(this);

          // when
          const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

          // then
          assert.dom(screen.queryByRole('alert')).doesNotExist();
          assert
            .dom(
              screen.queryByRole('link', {
                name: this.intl.t('common.data-protection-policy-information-banner.url-label'),
              })
            )
            .doesNotExist();
        });
      });

      module('when user should see the data protection policy update information', function () {
        test('should display the banner', async function (assert) {
          // given
          _communicationBannerIsNotDisplayed();
          _userShouldSeeTheDataProtectionPolicyUpdateInformation(this);

          // when
          const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

          // then
          assert.dom(screen.getByRole('alert')).exists();
          assert
            .dom(
              screen.getByRole('link', {
                name: this.intl.t('common.data-protection-policy-information-banner.url-label'),
              })
            )
            .exists();

          const content = screen.getByText((content) =>
            content.startsWith(
              'Notre politique de confidentialité a évolué. Nous vous invitons à en prendre connaissance :'
            )
          );
          assert.dom(content).exists();
        });
      });
    });
  });
});

function _userIsNotLoggedIn(component) {
  class CurrentUserStub extends Service {
    user = undefined;
  }
  component.owner.register('service:currentUser', CurrentUserStub);
}

function _communicationBannerIsDisplayed() {
  ENV.APP.BANNER_CONTENT = 'information banner text ...';
  ENV.APP.BANNER_TYPE = 'error';
}

function _communicationBannerIsNotDisplayed() {
  ENV.APP.BANNER_CONTENT = undefined;
  ENV.APP.BANNER_TYPE = undefined;
}

function _userShouldSeeTheDataProtectionPolicyUpdateInformation(component) {
  _stubUserWithShouldSeeTheDataProtectionPolicyUpdateInformationAs(true, component);
}

function _userShouldNotSeeTheDataProtectionPolicyUpdateInformation(component) {
  _stubUserWithShouldSeeTheDataProtectionPolicyUpdateInformationAs(false, component);
}

function _stubUserWithShouldSeeTheDataProtectionPolicyUpdateInformationAs(shouldSeeValue, component) {
  const store = component.owner.lookup('service:store');
  class CurrentUserStub extends Service {
    user = store.createRecord('user', {
      shouldSeeDataProtectionPolicyInformationBanner: shouldSeeValue,
    });
  }
  component.owner.register('service:currentUser', CurrentUserStub);
}
