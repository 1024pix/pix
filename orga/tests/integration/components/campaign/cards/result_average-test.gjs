import { render } from '@1024pix/ember-testing-library';
import ResultAverage from 'pix-orga/components/campaign/cards/result-average';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::ResultAverage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display average result card', async function (assert) {
    const averageResult = 0.91234;

    const screen = await render(<template><ResultAverage @value={{averageResult}} /></template>);

    assert.dom(screen.getByText(t('cards.participants-average-results.title'))).exists();
    assert.dom(screen.getByText('91 %')).exists();
  });
});
