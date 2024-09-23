import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ShowMoreText', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when text is too long', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<ShowMoreText>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultrices ultricies, nunc nisi
    aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultrices ultricies, nunc nisi aliquam nisi, eu
    tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultrices ultricies, nunc nisi aliquam nisi, eu tincidunt nisl
    nisl eu nisl.</p>
</ShowMoreText>`);
    });

    test('it should shrink text', async function (assert) {
      assert.strictEqual(
        screen.getByText(/Lorem ipsum dolor sit amet/).closest('.show-more-text__text-container').classList.length,
        2,
      );
      assert.true(
        screen
          .getByText(/Lorem ipsum dolor sit amet/)
          .closest('.show-more-text__text-container')
          .classList.contains('show-more-text__text-container--shrinked'),
      );
    });

    test('it should display a text expand button', async function (assert) {
      const expandButton = screen.getByRole('button');
      assert.strictEqual(expandButton.innerText, t('common.actions.show-more'));
      assert.dom(expandButton).exists();
      await click(expandButton);
      assert.false(
        screen
          .getByText(/Lorem ipsum dolor sit amet/)
          .closest('.show-more-text__text-container')
          .classList.contains('show-more-text__text-container--shrinked'),
      );
      assert.strictEqual(expandButton.innerText, t('common.actions.show-less'));
    });
  });

  module('when text is short', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      screen = await render(hbs`{{! template-lint-disable no-bare-strings }}
<ShowMoreText>
  <p>Lorem ipsum</p>
</ShowMoreText>`);
    });

    test('it should not shrink text', async function (assert) {
      assert.strictEqual(
        screen.getByText(/Lorem ipsum/).closest('.show-more-text__text-container').classList.length,
        3,
      );
      assert.true(
        screen
          .getByText(/Lorem ipsum/)
          .closest('.show-more-text__text-container')
          .classList.contains('show-more-text__text-container--one-line'),
      );
    });

    test('it should not display a text expand button', async function (assert) {
      assert.dom(screen.queryByRole('button')).doesNotExist();
    });
  });
});
