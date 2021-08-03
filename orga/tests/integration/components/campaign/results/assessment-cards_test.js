import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::Results::AssessmentCards', function(hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  module('Average result card', function() {

    test('It should display average result title and score for an ASSESSMENT campaign', async function(assert) {
      // given
      this.averageResult = 0.9;

      //when
      await render(hbs`<Campaign::Results::AssessmentCards @averageResult={{averageResult}} />`);

      //then
      assert.contains(t('charts.participants-average-results.title'));
      assert.contains('9');
    });
  });

  module('Shared results card', function() {
    test('It should display submitted results title and score for an ASSESSMENT campaign', async function(assert) {
      // given
      this.sharedParticipationsCount = 10;

      // when
      await render(hbs`<Campaign::Results::AssessmentCards @sharedParticipationsCount={{sharedParticipationsCount}} />`);

      //then
      assert.contains(t('charts.submitted-count.title'));
      assert.contains('10');
    });
  });

});
