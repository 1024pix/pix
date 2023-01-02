import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

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
          shouldSeeDataProtectionPolicyInformationBanner: true,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

      // when
      const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

      // then
      assert
        .dom(
          screen.getByRole('alert', {
            name: this.intl.t('common.data-protection-policy-information-banner.aria-label'),
          })
        )
        .exists();
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

    module('when data protection policy update date is null for example ', function () {
      test('should not display the banner', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        class CurrentUserStub extends Service {
          user = store.createRecord('user', {
            lastDataProtectionPolicySeenAt: 'coucou',
            cgu: true,
            shouldSeeDataProtectionPolicyInformationBanner: false,
          });
        }
        this.owner.register('service:currentUser', CurrentUserStub);

        // when
        const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

        // then
        assert
          .dom(
            screen.queryByRole('alert', {
              name: this.intl.t('common.data-protection-policy-information-banner.aria-label'),
            })
          )
          .doesNotExist();
      });
    });
  });

  module('when user already seen the data protection policy information', function () {
    test('should not display the banner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: 'coucou',
          cgu: true,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

      // when
      const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

      // then
      assert
        .dom(
          screen.queryByRole('alert', {
            name: this.intl.t('common.data-protection-policy-information-banner.aria-label'),
          })
        )
        .doesNotExist();
    });

    module('when data protection policy update date since last seen', function () {
      test('should display the banner', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        class CurrentUserStub extends Service {
          user = store.createRecord('user', {
            lastDataProtectionPolicySeenAt: null,
            cgu: true,
            shouldSeeDataProtectionPolicyInformationBanner: true,
          });
        }
        this.owner.register('service:currentUser', CurrentUserStub);

        // when
        const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

        // then
        assert
          .dom(
            screen.getByRole('alert', {
              name: this.intl.t('common.data-protection-policy-information-banner.aria-label'),
            })
          )
          .exists();
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

  module('when user is a student', function () {
    test('should not display the banner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          lastDataProtectionPolicySeenAt: null,
          cgu: false,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });
      }
      this.owner.register('service:currentUser', CurrentUserStub);

      // when
      const screen = await render(hbs`<DataProtectionPolicyInformationBanner />`);

      // then
      assert
        .dom(
          screen.queryByRole('alert', {
            name: this.intl.t('common.data-protection-policy-information-banner.aria-label'),
          })
        )
        .doesNotExist();
    });
  });
});
