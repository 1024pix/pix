import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Analysis::TubeRecommendationRow', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let tutorial1;
  let tutorial2;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    tutorial1 = store.createRecord('tutorial', {
      title: 'tutorial1',
      link: 'http://link.to.tuto.1',
      format: 'Vidéo',
      source: 'Youtube',
      duration: 600,
    });

    tutorial2 = store.createRecord('tutorial', {
      title: 'tutorial2',
      link: 'http://link.to.tuto.2',
    });

    this.tubeRecommendation = store.createRecord('campaign-tube-recommendation', {
      id: '1_recTubeA',
      tubeId: 'recTubeA',
      competenceId: 'recCompA',
      competenceName: 'Competence A',
      tubePracticalTitle: 'Tube A',
      tubeDescription: 'Tube Desc A',
      areaColor: 'jaffa',
    });
  });

  test('it should display tube details', async function (assert) {
    // when
    await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

    // then
    const firstTube = '[aria-label="Sujet"]';
    assert.dom(firstTube).containsText('Tube A');
    assert.dom(firstTube).containsText('Competence A');
  });

  test('it should expand and display one tutorial in the list', async function (assert) {
    // given
    this.tubeRecommendation.tutorials = [tutorial1];

    await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

    // when
    await click('[data-icon="chevron-down"]');

    // then
    assert.dom('tr[aria-hidden="false"]').containsText('1 tuto recommandé par la communauté Pix');
    assert.dom('a[tabindex="0"]:first-child').containsText('tutorial1');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('Vidéo');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('10 minutes');
    assert.dom('[aria-label="Tutoriel"]:first-child').containsText('Par Youtube');
    assert.dom('button[aria-expanded="true"]').exists();
    assert.contains('Tube Desc A');
  });

  test('it should hide element to screen reader', async function (assert) {
    // given
    this.tubeRecommendation.tutorials = [tutorial1];

    await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

    // then
    assert.dom('tr[aria-hidden="true"]').containsText('1 tuto recommandé par la communauté Pix');
    assert.dom('a[tabindex="-1"]:first-child').containsText('tutorial1');
    assert.dom('button[aria-expanded="false"]').exists();
    assert.contains('Tube Desc A');
  });

  test('it should expand and display 2 tutorials in the list', async function (assert) {
    // given
    this.tubeRecommendation.tutorials = [tutorial1, tutorial2];

    await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

    // when
    await click('[data-icon="chevron-down"]');

    // then
    assert.dom('[aria-hidden="false"]').containsText('2 tutos recommandés par la communauté Pix');
  });

  test('it should collapse and hide tube tutorials list', async function (assert) {
    // given
    this.tubeRecommendation.tutorials = [tutorial1, tutorial2];

    await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);
    await click('[data-icon="chevron-down"]');

    // when
    await click('[data-icon="chevron-up"]');

    // then
    assert.dom('[aria-hidden="false"]').doesNotExist();
    assert.dom('[aria-expanded="false"]').exists();
  });

  module('Testing the number of tutorials', () => {
    test('it should display "1 tuto" when there is only one tutorial', async function (assert) {
      // given
      this.tubeRecommendation.tutorials = [tutorial1];

      //when
      await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

      // then
      assert.dom('[aria-label="Sujet"]').containsText('1 tuto');
    });

    test('it should display "2 tutos" when there are two tutorials', async function (assert) {
      // given
      this.tubeRecommendation.tutorials = [tutorial1, tutorial2];

      //when
      await render(hbs`<Campaign::Analysis::TubeRecommendationRow @tubeRecommendation={{this.tubeRecommendation}} />`);

      // then
      assert.dom('[aria-label="Sujet"]').containsText('2 tutos');
    });
  });
});
