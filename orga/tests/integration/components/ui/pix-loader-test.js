import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::PixLoader', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // when
      const screen = await render(hbs`<Ui::PixLoader />`);

      // then
      assert.ok(screen.getByText(t('common.loading')));
    });
  });
});
