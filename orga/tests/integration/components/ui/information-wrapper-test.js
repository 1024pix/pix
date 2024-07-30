import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Information Wrapper', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('yield', function () {
    test('should display yield content', async function (assert) {
      const screen = await render(hbs`<Ui::InformationWrapper> toto </Ui::InformationWrapper>`);

      assert.ok(screen.getByText('toto'));
    });
  });
});
