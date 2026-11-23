import { render } from '@1024pix/ember-testing-library';
import SharedCount from 'pix-orga/components/campaign/cards/shared-count';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::SharedCount', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display shared count card', async function (assert) {
    const sharedCount = 10;

    const screen = await render(<template><SharedCount @value={{sharedCount}} /></template>);

    assert.dom(screen.getByText(t('cards.submitted-count.title'))).exists();
    assert.dom(screen.getByText('10')).exists();
  });
});
