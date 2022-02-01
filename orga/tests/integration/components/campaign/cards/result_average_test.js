import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::ResultAverage', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  test('it should display average result card', async function (assert) {
    this.averageResult = 0.91234;

    await render(hbs`<Campaign::Cards::ResultAverage @value={{averageResult}} />`);

    assert.contains(t('cards.participants-average-results.title'));
    assert.contains('91 %');
  });
});
