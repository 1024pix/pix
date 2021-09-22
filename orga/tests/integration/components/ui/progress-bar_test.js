import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui::ProgressBar', function (hooks) {
  setupRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render the component with the given value', async function (assert) {
      // given
      this.set('value', 0.8);

      // when
      await render(hbs`<Ui::ProgressBar @value={{value}} />`);

      // then
      assert.dom('.progress-bar--completion').hasAttribute('style', 'width: 80%');
    });
  });
});
