import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import FocusedOutNotification from 'mon-pix/components/challenge/focusedOutNotification';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const MESSAGE_KEYS = {
  default: 'pages.challenge.has-focused-out-of-window.default',
  v2: 'pages.challenge.has-focused-out-of-window.certification',
  v3: 'pages.challenge.has-focused-out-of-window.v3-certification',
  v3Accessible: 'pages.challenge.has-focused-out-of-window.v3-accessible-certification',
};

module('Integration | Component | Challenge | FocusedOutNotification', function (hooks) {
  setupIntlRenderingTest(hooks);

  function assertOnlyMessage(assert, screen, expectedKey) {
    Object.values(MESSAGE_KEYS).forEach((key) => {
      if (key === expectedKey) {
        assert.dom(screen.getByText(t(key))).exists();
      } else {
        assert.dom(screen.queryByText(t(key))).doesNotExist();
      }
    });
  }

  test('should not display anything when user has not focused out of window', async function (assert) {
    // when
    const screen = await render(
      <template><FocusedOutNotification @hasFocusedOutOfWindow={{false}} @isCertification={{false}} /></template>,
    );

    // then
    assertOnlyMessage(assert, screen, null);
  });

  module('when user has focused out of window', function () {
    module('when assessment is not of type certification', function () {
      test("should show default focus out's error message", async function (assert) {
        // when
        const screen = await render(
          <template><FocusedOutNotification @hasFocusedOutOfWindow={{true}} @isCertification={{false}} /></template>,
        );

        // then
        assertOnlyMessage(assert, screen, MESSAGE_KEYS.default);
      });
    });

    module('when assessment is of type certification', function () {
      module('when certification course version is 2', function () {
        test("should show certification focus out's error message", async function (assert) {
          // when
          const screen = await render(
            <template>
              <FocusedOutNotification
                @hasFocusedOutOfWindow={{true}}
                @isCertification={{true}}
                @certificationVersion={{2}}
              />
            </template>,
          );

          // then
          assertOnlyMessage(assert, screen, MESSAGE_KEYS.v2);
        });
      });

      module('when certification course version is 3', function () {
        module('when the candidate does not need an accessibility adjustment', function () {
          test("should show a specific certification focus out's error message", async function (assert) {
            // when
            const screen = await render(
              <template>
                <FocusedOutNotification
                  @hasFocusedOutOfWindow={{true}}
                  @isCertification={{true}}
                  @certificationVersion={{3}}
                  @isAdjustedCourseForAccessibility={{false}}
                />
              </template>,
            );

            // then
            assertOnlyMessage(assert, screen, MESSAGE_KEYS.v3);
          });
        });

        module('when the candidate needs an accessibility adjustment', function () {
          test("should show another specific certification focus out's error message", async function (assert) {
            // when
            const screen = await render(
              <template>
                <FocusedOutNotification
                  @hasFocusedOutOfWindow={{true}}
                  @isCertification={{true}}
                  @certificationVersion={{3}}
                  @isAdjustedCourseForAccessibility={{true}}
                />
              </template>,
            );

            // then
            assertOnlyMessage(assert, screen, MESSAGE_KEYS.v3Accessible);
          });
        });
      });
    });
  });
});
