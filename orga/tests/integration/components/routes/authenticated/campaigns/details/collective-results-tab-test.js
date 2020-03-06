import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | collective-results-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display competence view', async function(assert) {
    // given
    const campaignCollectiveResult = store.createRecord('campaign-collective-result', {
      id: 1,
      campaignId: 1,
      collectiveResultsByCompetence: [],
    });

    this.set('campaignCollectiveResult', campaignCollectiveResult);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResultsTab 
      @campaignCollectiveResult={{this.campaignCollectiveResult}}
      @sharedParticipationsCount={{1}}
      @view="competence" />`);

    // then
    assert.dom('table').containsText('Compétences');
  });

  test('it should display tube view', async function(assert) {
    // given
    const campaignCollectiveResult = store.createRecord('campaign-collective-result', {
      id: 1,
      campaignId: 1,
      collectiveResultsByTube: [],
    });

    this.set('campaignCollectiveResult', campaignCollectiveResult);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResultsTab 
      @campaignCollectiveResult={{this.campaignCollectiveResult}}
      @sharedParticipationsCount={{1}}
      @view="tube" />`);

    // then
    assert.dom('table').containsText('Sujets');
  });
});
