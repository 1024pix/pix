import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix-loader', function(hooks) {
  setupRenderingTest(hooks);

  module('Component rendering', function() {

    test('should render component', async function(assert) {
      // when
      await render(hbs`<PixLoader />`);

      // then
      assert.dom('.app-loader__text').containsText('En cours de chargement...');
    });
  });
});
