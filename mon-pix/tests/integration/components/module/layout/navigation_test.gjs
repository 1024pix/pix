import { render } from '@1024pix/ember-testing-library';
import { triggerKeyEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import InformationBanners from 'mon-pix/components/information-banners';
import ModulixNavigation from 'mon-pix/components/module/layout/navigation';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Navigation', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('setHTMLElementOffset', function () {
    module('when there is no banner', function () {
      test('should place the navbar at the beginning of the page', async function (assert) {
        // given
        const sections = [
          {
            type: 'question-yourself',
          },
          {
            type: 'explore-to-understand',
          },
        ];

        // when
        await render(<template><ModulixNavigation @sections={{sections}} /></template>);

        // then
        assert.dom('#module-navigation').doesNotHaveAttribute('style');
      });
    });

    module('when there is a banner', function () {
      test('should place the navbar below the banner', async function (assert) {
        // given
        const sections = [
          {
            type: 'question-yourself',
          },
          {
            type: 'explore-to-understand',
          },
        ];
        const banners = [
          {
            message: 'Une information importante',
            severity: 'information',
          },
        ];

        // when
        await render(
          <template>
            <div id="pix-layout-banner-container">
              <InformationBanners @banners={{banners}} />
            </div>
            <ModulixNavigation @sections={{sections}} />
          </template>,
        );

        // then
        assert.dom('#module-navigation').hasAttribute('style', /^top: \d+(\.\d+)?px;?$/);
      });
    });
  });

  module('handleArrowKeyNavigation', function () {
    module('when user press arrow down or right on buttons', function () {
      test('should focus on next button', async function (assert) {
        // given
        const sections = [
          {
            type: 'question-yourself',
          },
          {
            type: 'explore-to-understand',
          },
          {
            type: 'retain-the-essentials',
          },
        ];

        // when
        const screen = await render(<template><ModulixNavigation @sections={{sections}} /></template>);
        const button = screen.getByRole('button', {
          name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
            indexSection: 1,
            totalSections: 3,
          })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
            sectionTitle: 'Se questionner',
          })}`,
        });
        button.focus();
        await triggerKeyEvent(button, 'keydown', 40);

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
                indexSection: 2,
                totalSections: 3,
              })} ${t('pages.modulix.navigation.buttons.aria-label.disabled')}`,
            }),
          )
          .isFocused();
      });
    });

    module('when user press arrow up or left on buttons', function () {
      test('should focus on next button', async function (assert) {
        // given
        const sections = [
          {
            type: 'question-yourself',
          },
          {
            type: 'explore-to-understand',
          },
          {
            type: 'retain-the-essentials',
          },
        ];

        // when
        const screen = await render(<template><ModulixNavigation @sections={{sections}} /></template>);
        const button = screen.getByRole('button', {
          name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
            indexSection: 2,
            totalSections: 3,
          })} ${t('pages.modulix.navigation.buttons.aria-label.disabled')}`,
        });
        button.focus();
        await triggerKeyEvent(button, 'keydown', 38);

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
                indexSection: 1,
                totalSections: 3,
              })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
                sectionTitle: 'Se questionner',
              })}`,
            }),
          )
          .isFocused();
      });
    });
  });
});
