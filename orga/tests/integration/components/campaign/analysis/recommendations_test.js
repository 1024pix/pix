import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Analysis::Recommendations', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  module('when the analysis is displayed', function (hooks) {
    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');

      const campaignTubeRecommendation_1 = store.createRecord('campaign-tube-recommendation', {
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

      this.campaignTubeRecommendations = [campaignTubeRecommendation_1, campaignTubeRecommendation_2];

      await render(hbs`<Campaign::Analysis::Recommendations
      @campaignTubeRecommendations={{campaignTubeRecommendations}}
      @displayAnalysis={{true}}
    />`);
    });

    test('it should display the tube analysis list of the campaign', async function (assert) {
      assert.dom('[aria-label="Sujet"]').exists({ count: 2 });
      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
    });

    test('it should display tube details', async function (assert) {
      const firstTube = '[aria-label="Sujet"]:first-child';
      assert.dom(firstTube).containsText('Tube A');
      assert.dom(firstTube).containsText('Competence A');
    });

    test('it should order by recommendation desc by default', async function (assert) {
      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
    });

    test('it should order by recommendation asc', async function (assert) {
      await click('[aria-label="Trier par pertinence"]');

      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube B');
    });

    test('it should order by recommendation desc', async function (assert) {
      await click('[aria-label="Trier par pertinence"]');
      await click('[aria-label="Trier par pertinence"]');

      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
    });
  });

  module('when the analysis is not displayed', function () {
    test('it displays pending results', async function (assert) {
      this.campaignTubeRecommendations = [];

      await render(hbs`<Campaign::Analysis::Recommendations
        @campaignTubeRecommendations={{campaignTubeRecommendations}}
        @displayAnalysis={{false}}
      />`);
      assert.contains('En attente de résultats');
    });
  });
});
