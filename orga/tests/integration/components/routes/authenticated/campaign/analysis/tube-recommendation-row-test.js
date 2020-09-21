import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/analysis/tube-recommendation-row', function(hooks) {
  setupRenderingTest(hooks);

  let store;
  let tubeRecommendation;
  let tutorial1;
  let tutorial2;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

    tutorial1 = store.createRecord('tutorial', {
      title: 'tutorial1',
      link: 'http://link.to.tuto.1',
      format: 'Vidéo',
      source: 'Youtube',
      duration: '00:10:00',
    });

    tutorial2 = store.createRecord('tutorial', {
      title: 'tutorial2',
      link: 'http://link.to.tuto.2',
    });

    tubeRecommendation = store.createRecord('campaign-tube-recommendation', {
      id: '1_recTubeA',
      tubeId: 'recTubeA',
      competenceId: 'recCompA',
      competenceName: 'Competence A',
      tubePracticalTitle: 'Tube A',
      areaColor: 'jaffa',
    });

    this.set('tubeRecommendation', tubeRecommendation);
  });

  test('it should display tube details', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaign::Analysis::TubeRecommendationRow
      @tubeRecommendation={{tubeRecommendation}}
    />`);

    // then
    const firstTube = '[aria-label="Sujet"]';
    assert.dom(firstTube).containsText('Tube A');
    assert.dom(firstTube).containsText('Competence A');
  });

  test('it should expand and display one tutorial in the list', async function(assert) {
    // given
    tubeRecommendation.tutorials = [tutorial1];

    await render(hbs`<Routes::Authenticated::Campaign::Analysis::TubeRecommendationRow
      @tubeRecommendation={{tubeRecommendation}}
    />`);

    // when
    await click('[data-icon="chevron-down"]');

    // then
    assert.dom('[aria-hidden="false"]').containsText('1 tuto recommandé par la communauté Pix');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('tutorial1');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('Vidéo');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('10 minutes');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('Par Youtube');
    assert.dom('[aria-expanded="true"]').exists();
  });

  test('it should expand and display 2 tutorials in the list', async function(assert) {
    // given
    tubeRecommendation.tutorials = [tutorial1, tutorial2];

    await render(hbs`<Routes::Authenticated::Campaign::Analysis::TubeRecommendationRow
      @tubeRecommendation={{tubeRecommendation}}
    />`);

    // when
    await click('[data-icon="chevron-down"]');

    // then
    assert.dom('[aria-hidden="false"]').containsText('2 tutos recommandés par la communauté Pix');
  });

  test('it should collapse and hide tube tutorials list', async function(assert) {
    // given
    tubeRecommendation.tutorials = [tutorial1, tutorial2];

    await render(hbs`<Routes::Authenticated::Campaign::Analysis::TubeRecommendationRow
      @tubeRecommendation={{tubeRecommendation}}
    />`);
    await click('[data-icon="chevron-down"]');

    // when
    await click('[data-icon="chevron-up"]');

    // then
    assert.dom('[aria-hidden="false"]').doesNotExist();
    assert.dom('[aria-expanded="false"]').exists();
  });

  test('it should display a "no data" message when tutorials are empty', async function(assert) {
    // given
    tubeRecommendation.tutorials = [];

    await render(hbs`<Routes::Authenticated::Campaign::Analysis::TubeRecommendationRow
      @tubeRecommendation={{tubeRecommendation}}
    />`);

    // when
    await click('[data-icon="chevron-down"]');

    // then
    assert.dom('[aria-hidden="false"]').containsText('Aucun tuto recommandé pour ce sujet.');
  });
});
