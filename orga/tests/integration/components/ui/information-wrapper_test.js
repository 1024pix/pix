import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui | Information Wrapper', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('yield', function () {
    test('should display yield content', async function (assert) {
      await render(hbs`<Ui::InformationWrapper>
  toto
</Ui::InformationWrapper>`);

      assert.contains('toto');
    });
  });
});
