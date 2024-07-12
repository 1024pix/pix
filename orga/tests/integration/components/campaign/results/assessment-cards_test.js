import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::AssessmentCards', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the campaign has no stages', function () {
    test('It should display average result card', async function (assert) {
      // given
      this.averageResult = 0.9;

      //when
      const screen = await render(hbs`<Campaign::Results::AssessmentCards @averageResult={{this.averageResult}} />`);

      //then
      assert.dom(screen.getByText(t('cards.participants-average-results.title'))).exists();
    });
  });

  module('When the campaign has stages', function () {
    test('It should display average stage card', async function (assert) {
      // given
      this.hasStages = true;
      this.stages = [{ threshold: 20 }, { threshold: 70 }];
      this.averageResult = 0.5;

      //when
      const screen = await render(
        hbs`<Campaign::Results::AssessmentCards
  @averageResult={{this.averageResult}}
  @hasStages={{this.hasStages}}
  @stages={{this.stages}}
/>`,
      );

      //then
      assert.dom(screen.getByText(t('cards.participants-average-stages.title'))).exists();
    });
  });

  test('It should display shared participation card', async function (assert) {
    // given
    this.sharedParticipationsCount = 10;

    // when
    const screen = await render(
      hbs`<Campaign::Results::AssessmentCards @sharedParticipationsCount={{this.sharedParticipationsCount}} />`,
    );

    //then
    assert.dom(screen.getByText(t('cards.submitted-count.title'))).exists();
  });
});
