import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui::PixLoader', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function() {

    test('should render component', async function(assert) {
      // when
      await render(hbs`<Ui::PixLoader />`);

      // then
      assert.contains('Chargement en cours');
    });
  });
});
