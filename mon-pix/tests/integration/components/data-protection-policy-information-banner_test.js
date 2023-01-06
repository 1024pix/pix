import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';
import ENV from 'mon-pix/config/environment';

module('Integration | Component | data-protection-policy-information-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user has not seen the data protection policy information', function () {
    test('should display the banner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: null,
          cgu: true,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

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

  module('when user already seen the data protection policy information', function () {
    test('should not display the banner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: new Date('2000-01-22T15:15:52Z'),
          cgu: true,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

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

  module('when user is a student', function () {
    test('should not display the banner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: null,
          cgu: false,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

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

  module('when communication banner is displayed', function () {
    test('should not display the data protection policy banner', async function (assert) {
      // given
      ENV.APP.BANNER_CONTENT = 'information banner text ...';
      ENV.APP.BANNER_TYPE = 'error';
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: null,
          cgu: true,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

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
});
