import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | progress-bar', (hooks) => {
  setupRenderingTest(hooks);

  module('Component rendering', () => {
    test('should render the component with the given value', async function(assert) {
      // given
      this.set('value', 80);

      // when
      await render(hbs`<ProgressBar @value={{value}} />`);

      // then
      assert.dom('.progress-bar--completion').hasAttribute('style', 'width: 80%');
    });

    test('should render the component with the given children', async function(assert) {
      // when
      await render(hbs`<ProgressBar>Text</ProgressBar>`);

      // then
      assert.contains('Text');
    });
  });
});
