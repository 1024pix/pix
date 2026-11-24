import { render } from '@1024pix/ember-testing-library';
import AssessmentCards from 'pix-orga/components/campaign/results/assessment-cards';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::AssessmentCards', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the campaign has no stages', function () {
    test('It should display average result card', async function (assert) {
      // given
      const averageResult = 0.9;

      //when
      const screen = await render(<template><AssessmentCards @averageResult={{averageResult}} /></template>);

      //then
      assert.dom(screen.getByText(t('cards.participants-average-results.title'))).exists();
    });
  });

  module('When the campaign has stages', function () {
    test('It should display average stage card', async function (assert) {
      // given
      const hasStages = true;
      const stages = [{ threshold: 20 }, { threshold: 70 }];
      const averageResult = 0.5;

      //when
      const screen = await render(
        <template>
          <AssessmentCards @averageResult={{averageResult}} @hasStages={{hasStages}} @stages={{stages}} />
        </template>,
      );

      //then
      assert.dom(screen.getByText(t('cards.participants-average-stages.title'))).exists();
    });
  });

  test('It should display shared participation card', async function (assert) {
    // given
    const sharedParticipationsCount = 10;

    // when
    const screen = await render(
      <template><AssessmentCards @sharedParticipationsCount={{sharedParticipationsCount}} /></template>,
    );

    //then
    assert.dom(screen.getByText(t('cards.submitted-count.title'))).exists();
  });
});
