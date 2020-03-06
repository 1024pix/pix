import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | collective-results-tab', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display collective-results-tab', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResultsTab />`);

    // then
    assert.dom('div').exists();
  });
});
