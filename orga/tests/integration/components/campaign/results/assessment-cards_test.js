import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::Results::AssessmentCards', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  module('When the campaign has no stages', function () {
    test('It should display average result card', async function (assert) {
      // given
      this.averageResult = 0.9;

      //when
      await render(hbs`<Campaign::Results::AssessmentCards @averageResult={{this.averageResult}} />`);

      //then
      assert.contains(t('cards.participants-average-results.title'));
    });
  });

  module('When the campaign has stages', function () {
    test('It should display average stage card', async function (assert) {
      // given
      this.hasStages = true;
      this.stages = [{ threshold: 20 }, { threshold: 70 }];
      this.averageResult = 0.5;

      //when
      await render(
        hbs`<Campaign::Results::AssessmentCards
  @averageResult={{this.averageResult}}
  @hasStages={{this.hasStages}}
  @stages={{this.stages}}
/>`
      );

      //then
      assert.contains(t('cards.participants-average-stages.title'));
    });
  });

  test('It should display shared participation card', async function (assert) {
    // given
    this.sharedParticipationsCount = 10;

    // when
    await render(
      hbs`<Campaign::Results::AssessmentCards @sharedParticipationsCount={{this.sharedParticipationsCount}} />`
    );

    //then
    assert.contains(t('cards.submitted-count.title'));
  });
});
