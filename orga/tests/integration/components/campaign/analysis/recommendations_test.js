import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Analysis::Recommendations', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let screen;

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

      screen = await render(hbs`<Campaign::Analysis::Recommendations
  @campaignTubeRecommendations={{this.campaignTubeRecommendations}}
  @displayAnalysis={{true}}
/>`);
    });

    test('it should display the tube analysis list of the campaign', async function (assert) {
      const subjects = screen.getAllByLabelText('Sujet');
      assert.strictEqual(subjects.length, 2);
      assert.dom(subjects[0]).containsText('Tube A');
    });

    test('it should display tube details', async function (assert) {
      const firstTube = screen.getAllByLabelText('Sujet')[0];
      assert.dom(firstTube).containsText('Tube A');
      assert.dom(firstTube).containsText('Competence A');
    });

    test('it should order by recommendation desc by default', async function (assert) {
      assert.dom(screen.getAllByLabelText('Sujet')[0]).containsText('Tube A');
    });

    test('it should order by recommendation asc', async function (assert) {
      await click(
        screen.getByLabelText(
          "Le tableau n'est actuellement pas trié par pertinence. Cliquez pour trier par ordre croissant."
        )
      );

      assert.dom(screen.getAllByLabelText('Sujet')[0]).containsText('Tube B');
    });

    test('it should order by recommendation desc', async function (assert) {
      await click(
        screen.getByLabelText(
          "Le tableau n'est actuellement pas trié par pertinence. Cliquez pour trier par ordre croissant."
        )
      );
      await click(
        screen.getByLabelText('Le tableau est trié par pertinence croissante. Cliquez pour trier en ordre décroissant.')
      );

      assert.dom(screen.getAllByLabelText('Sujet')[0]).containsText('Tube A');
    });

    test('it should have a caption to describe the table', async function (assert) {
      assert.contains(this.intl.t('pages.campaign-review.table.analysis.caption'));
    });
  });

  module('when the analysis is not displayed', function () {
    test('it displays pending results', async function (assert) {
      this.campaignTubeRecommendations = [];

      await render(hbs`<Campaign::Analysis::Recommendations
  @campaignTubeRecommendations={{this.campaignTubeRecommendations}}
  @displayAnalysis={{false}}
/>`);
      assert.contains('En attente de résultats');
    });
  });
});
