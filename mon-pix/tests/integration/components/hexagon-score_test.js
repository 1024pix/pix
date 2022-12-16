import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | hexagon-score', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should display two dashes, when no pixScore provided', async function (assert) {
      // given & when
      const screen = await render(hbs`<HexagonScore />`);

      // then
      assert.ok(screen.getByText('–'));
    });

    test('should display provided score in hexagon', async function (assert) {
      // given
      const pixScore = '777';
      this.set('pixScore', pixScore);

      // when
      const screen = await render(hbs`<HexagonScore @pixScore={{this.pixScore}} />`);

      // then
      assert.ok(screen.getByText(pixScore));
    });

    test('should display an information tooltip', async function (assert) {
      // given & when
      const screen = await render(hbs`<HexagonScore />`);

      // then
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.profile.total-score-helper.label') }));
    });
  });
});
