import { render } from '@1024pix/ember-testing-library';
import StageAverage from 'pix-orga/components/campaign/cards/stage-average';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::StageAverage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display average result card', async function (assert) {
    const totalStage = 3;
    const reachedStage = 2;
    const stages = [{ threshold: 0 }, { threshold: 20 }, { threshold: 70 }];

    const screen = await render(
      <template>
        <StageAverage @totalStage={{totalStage}} @reachedStage={{reachedStage}} @stages={{stages}} />
      </template>,
    );

    assert.dom(screen.getByText(t('cards.participants-average-stages.title'))).exists();
    assert.dom(screen.getByText(t('common.result.stages', { count: 1, total: 2 }))).exists();
  });
});
