import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::StageAverage', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  test('it should display average result card', async function (assert) {
    this.averageResult = 0.5;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    await render(hbs`<Campaign::Cards::StageAverage @value={{averageResult}} @stages={{stages}} />`);

    assert.contains(t('cards.participants-average-stages.title'));
    assert.contains(t('pages.assessment-individual-results.stages.value', { count: 1, total: 2 }));
  });
});
