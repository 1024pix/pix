import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | checkpoint-continue', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when is the final checkpoint', function () {
    test('should display "See my results" link', async function (assert) {
      // given
      this.nextPageButtonText = this.intl.t('pages.checkpoint.actions.next-page.results');

      // when
      const screen = await render(
        hbs`<CheckpointContinue @finalCheckpoint={{true}} @nextPageButtonText={{this.nextPageButtonText}} />`
      );

      // then
      assert.dom(screen.getByText(this.nextPageButtonText)).exists();
    });
  });

  module('when is not the final checkpoint', function () {
    test('should display "Continue" link', async function (assert) {
      // given
      this.nextPageButtonText = this.intl.t('pages.checkpoint.actions.next-page.continue');

      // when
      const screen = await render(
        hbs`<CheckpointContinue @finalCheckpoint={{false}} @nextPageButtonText={{this.nextPageButtonText}} />`
      );

      // then
      assert.dom(screen.getByText(this.nextPageButtonText)).exists();
    });
  });
});
