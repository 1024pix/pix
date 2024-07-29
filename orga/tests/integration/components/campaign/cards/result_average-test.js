import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::ResultAverage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display average result card', async function (assert) {
    this.averageResult = 0.91234;

    const screen = await render(hbs`<Campaign::Cards::ResultAverage @value={{this.averageResult}} />`);

    assert.dom(screen.getByText(t('cards.participants-average-results.title'))).exists();
    assert.dom(screen.getByText('91 %')).exists();
  });
});
