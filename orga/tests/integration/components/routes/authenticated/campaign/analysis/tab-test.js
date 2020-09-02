import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/analysis/tab', function(hooks) {
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
      averageScore: 10,
    });

    const campaignTubeRecommendation_2 = store.createRecord('campaign-tube-recommendation', {
      id: '1_recTubeB',
      tubeId: 'recTubeB',
      competenceId: 'recCompB',
      competenceName: 'Competence B',
      tubePracticalTitle: 'Tube B',
      areaColor: 'emerald',
      averageScore: 30,
    });

    this.set('campaignTubeRecommendations', [campaignTubeRecommendation_1, campaignTubeRecommendation_2]);
  });

  module('when analysis is displayed', async function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`<Routes::Authenticated::Campaign::Analysis::Tab
        @campaignTubeRecommendations={{campaignTubeRecommendations}}
        @displayAnalysis={{true}}
      />`);
    });

    test('it should display the tube analysis list of the campaign', async function(assert) {
      assert.dom('[aria-label="Sujet"]').exists({ count: 2 });
      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
    });

    test('it should display tube details', async function(assert) {
      const firstTube = '[aria-label="Sujet"]:first-child';
      assert.dom(firstTube).containsText('Tube A');
      assert.dom(firstTube).containsText('Competence A');
    });

    test('it should order by recommendation asc', async function(assert) {
      await click('[aria-label="Analyse par sujet"] thead [role="button"]:first-child');

      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube B');
    });

    test('it should order by recommendation desc', async function(assert) {
      const recommendationColumn = '[aria-label="Analyse par sujet"] thead [role="button"]:first-child';
      await click(recommendationColumn);
      await click(recommendationColumn);

      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
    });
  });

  test('it should not display tube details when display', async function(assert) {
    await render(hbs`<Routes::Authenticated::Campaign::Analysis::Tab
      @campaignTubeRecommendations={{campaignTubeRecommendations}}
      @displayAnalysis={{false}}
    />`);

    assert.dom('[aria-label="Sujet"]').doesNotExist;
    assert.dom('.table__empty').containsText('En attente de résultats');
  });
});
