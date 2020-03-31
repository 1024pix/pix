import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaigns/details/analysis-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;
  let campaignTubeRecommendation_1;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

    campaignTubeRecommendation_1 = store.createRecord('campaign-tube-recommendation', {
      id: '1_recTubeA',
      tubeId: 'recTubeA',
      competenceId: 'recCompA',
      competenceName: 'Competence A',
      tubePracticalTitle: 'Tube A',
      areaColor: 'jaffa',
    });

    const campaignTubeRecommendation_2 = store.createRecord('campaign-tube-recommendation', {
      id: '1_recTubeB',
      tubeId: 'recTubeB',
      competenceId: 'recCompB',
      competenceName: 'Competence B',
      tubePracticalTitle: 'Tube B',
      areaColor: 'emerald',
    });

    this.set('campaignTubeRecommendations', [campaignTubeRecommendation_1, campaignTubeRecommendation_2]);
  });

  test('it should display the tube analysis list of the campaign', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::AnalysisTab
      @campaignTubeRecommendations={{campaignTubeRecommendations}}
    />`);

    // then
    assert.dom('[aria-label="Sujet"]').exists({ count: 2 });
  });

  test('it should display tube details', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::AnalysisTab
      @campaignTubeRecommendations={{campaignTubeRecommendations}}
    />`);

    // then
    const firstTube = '[aria-label="Sujet"]:first-child';
    assert.dom(firstTube).containsText('•');
    assert.dom(firstTube).containsText('Tube A');
    assert.dom(firstTube).containsText('Competence A');
  });
});
