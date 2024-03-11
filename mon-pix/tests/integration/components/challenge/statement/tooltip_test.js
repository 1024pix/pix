import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Tooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  const tooltip = '.tooltip-tag__information';
  const tooltipTitle = '.tooltip-tag-information__title';
  const confirmationButton = '.tooltip-tag-information__button';

  module('when challenge is focused', function () {
    module('when user has not seen the tooltip yet', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: false,
            save: () => {},
          };
        }
        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      test('should render the tooltip with a confirmation button', async function (assert) {
        // then
        assert.dom(tooltip).isVisible();
        assert.dom(tooltipTitle).exists();
        assert.dom('.tooltip__tag--focused').isVisible();
        assert.dom(confirmationButton).exists();
      });

      test('should remove the tooltip when confirmation button has been clicked', async function (assert) {
        // when
        await click('.tooltip-tag-information__button');
        // then
        assert.dom(tooltip).isNotVisible();
      });
    });

    module('when user has seen the tooltip', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: true,
          };
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      module('when the challenge starts', function () {
        test('should not render the tooltip', async function (assert) {
          // then
          assert.dom(tooltip).isNotVisible();
        });
      });

      module('when the user hovers the challenge icon', function () {
        module('when using a mouse', function () {
          test('should display the tooltip without a confirmation button when entering the icon', async function (assert) {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');

            // then
            assert.dom(tooltip).isVisible();
            assert.dom(tooltipTitle).exists();
            assert.dom(confirmationButton).doesNotExist();
          });

          test('should the hide tooltip when mouse leaves the icon', async function (assert) {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            await triggerEvent('.tooltip-tag__icon-button', 'mouseleave');

            // then
            assert.dom(tooltip).isNotVisible();
          });
        });

        module('when using a keyboard', function () {
          test('should hide the tooltip button when escaping', async function (assert) {
            // given
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            assert.dom(tooltip).isVisible();

            // when
            const escapeKeyCode = 27;
            await triggerKeyEvent('.tooltip-tag__icon-button', 'keyup', escapeKeyCode);

            // then
            assert.dom(tooltip).isNotVisible();
          });
        });
      });

      module('when the user clicks on the challenge icon', function () {
        test('should display the tooltip without a confirmation button when entering the icon', async function (assert) {
          // when
          await click('.tooltip-tag__icon-button');

          // then
          assert.dom(tooltip).isVisible();
          assert.dom(tooltipTitle).exists();
          assert.dom(confirmationButton).doesNotExist();
        });
      });
    });
  });

  module('when challenge is not focused', function () {
    module('when user has not seen the tooltip yet', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenOtherChallengesTooltip: false,
            save: () => {},
          };
        }
        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: false,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      test('should render the tooltip with a confirmation button', async function (assert) {
        // then
        assert.dom(tooltip).isVisible();
        assert.dom('.tooltip__tag--regular').isVisible();
        assert.dom(confirmationButton).exists();
      });

      test('should remove the tooltip when confirmation button has been clicked', async function (assert) {
        // when
        await click('.tooltip-tag-information__button');

        // then
        assert.dom(tooltip).isNotVisible();
      });
    });

    module('when user has seen the tooltip', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenOtherChallengesTooltip: true,
          };
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: false,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      module('when the challenge starts', function () {
        test('should not render the tooltip', async function (assert) {
          // then
          assert.dom(tooltip).isNotVisible();
        });
      });

      module('when the user hovers the challenge icon', function () {
        module('when using a mouse', function () {
          test('should display the tooltip without a confirmation button when entering the icon', async function (assert) {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');

            // then
            assert.dom(tooltip).isVisible();
            assert.dom(confirmationButton).doesNotExist();
          });

          test('should the hide tooltip when mouse leaves the icon', async function (assert) {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            await triggerEvent('.tooltip-tag__icon-button', 'mouseleave');

            // then
            assert.dom(tooltip).isNotVisible();
          });
        });

        module('when using a keyboard', function () {
          test('should hide the tooltip button when escaping', async function (assert) {
            // given
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            assert.dom(tooltip).isVisible();

            // when
            const escapeKeyCode = 27;
            await triggerKeyEvent('.tooltip-tag__icon-button', 'keyup', escapeKeyCode);

            // then
            assert.dom(tooltip).isNotVisible();
          });
        });
      });

      module('when the user clicks on the challenge icon', function () {
        test('should display the tooltip without a confirmation button when entering the icon', async function (assert) {
          // when
          await click('.tooltip-tag__icon-button');

          // then
          assert.dom(tooltip).isVisible();
          assert.dom(confirmationButton).doesNotExist();
        });
      });
    });
  });
});
