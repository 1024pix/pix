import { render } from '@1024pix/ember-testing-library';
import PixLoader from 'pix-orga/components/ui/pix-loader';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::PixLoader', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // when
      const screen = await render(<template><PixLoader /></template>);

      // then
      assert.ok(screen.getByText(t('common.loading')));
    });
  });
});
