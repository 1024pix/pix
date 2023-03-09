import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::StageAverage', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  test('it should display average result card', async function (assert) {
    this.averageResult = 0.5;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    const screen = await render(
      hbs`<Campaign::Cards::StageAverage @value={{this.averageResult}} @stages={{this.stages}} />`
    );

    assert.contains(t('cards.participants-average-stages.title'));
    assert
      .dom(screen.getByText(t('pages.assessment-individual-results.stages.value', { count: 1, total: 2 })))
      .exists();
  });
});
