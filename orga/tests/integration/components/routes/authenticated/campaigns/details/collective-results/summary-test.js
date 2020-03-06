import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaigns/details/collective-results/summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.set('averageValidatedSkillsSum', 3);
    this.set('totalSkills', 4);
    this.set('averageResult', 75);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::Summary
      @averageValidatedSkillsSum={{this.averageValidatedSkillsSum}}
      @totalSkills={{this.totalSkills}}
      @averageResult={{this.averageResult}}
    />`);

    // then
    assert.dom('.participant-results-content:first-child .content-text').hasText('3');
    assert.dom('.participant-results-content:nth-child(2) .content-text').hasText('4');
    assert.dom('.circle-chart').hasText('75%');
  });
});
