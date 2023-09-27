import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::StageAverage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display average result card', async function (assert) {
    this.totalStage = 3;
    this.reachedStage = 2;
    this.stages = [{ threshold: 0 }, { threshold: 20 }, { threshold: 70 }];

    const screen = await render(
      hbs`<Campaign::Cards::StageAverage
  @totalStage={{this.totalStage}}
  @reachedStage={{this.reachedStage}}
  @stages={{this.stages}}
/>`,
    );

    assert.dom(screen.getByText(this.intl.t('cards.participants-average-stages.title'))).exists();
    assert.dom(screen.getByText(this.intl.t('common.result.stages', { count: 1, total: 2 }))).exists();
  });
});
