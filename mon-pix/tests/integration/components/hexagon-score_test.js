import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | hexagon-score', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should display two dashes, when no pixScore provided', async function (assert) {
      // when
      await render(hbs`<HexagonScore />`);

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML, '–');
    });

    test('should display provided score in hexagon', async function (assert) {
      // given
      const pixScore = '777';
      this.set('pixScore', pixScore);
      // when
      await render(hbs`<HexagonScore @pixScore={{this.pixScore}} />`);
      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML, pixScore);
    });
  });
});
