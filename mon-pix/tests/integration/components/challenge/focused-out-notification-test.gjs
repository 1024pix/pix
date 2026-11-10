import { render } from '@1024pix/ember-testing-library';
import FocusedOutNotification from 'mon-pix/components/challenge/focusedOutNotification';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const MESSAGES = {
  default: 'Nous avons détecté un changement de page. En certification, votre réponse ne serait pas validée.',
  v2: 'Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant et répondez à la question en sa présence.',
  v3: "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler en direct de son « Espace Surveillant ».",
  v3Accessible:
    "Nous avons détecté un changement de page. Si vous avez été contraint de changer de page pour utiliser un outil d’accessibilité numérique (tel qu'un lecteur d'écran ou un clavier virtuel), répondez tout de même à la question.",
};

module('Integration | Component | Challenge | FocusedOutNotification', function (hooks) {
  setupIntlRenderingTest(hooks);

  function assertOnlyMessage(assert, screen, expectedMessage) {
    Object.values(MESSAGES).forEach((message) => {
      if (message === expectedMessage) {
        assert.dom(screen.getByText(message)).exists();
      } else {
        assert.dom(screen.queryByText(message)).doesNotExist();
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
        assertOnlyMessage(assert, screen, MESSAGES.default);
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
          assertOnlyMessage(assert, screen, MESSAGES.v2);
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
            assertOnlyMessage(assert, screen, MESSAGES.v3);
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
            assertOnlyMessage(assert, screen, MESSAGES.v3Accessible);
          });
        });
      });
    });
  });
});
