import { module, test } from 'qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Cards', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders no cards if there are no tutorials', async function (assert) {
    // given
    const tutorials = [];
    this.set('tutorials', tutorials);

    // when
    await render(hbs`<Tutorials::Cards @tutorials={{this.tutorials}} />`);

    // then
    assert.dom('.user-tutorials-content__cards').exists();
    assert.strictEqual(findAll('.tutorial-card').length, 0);
  });

  test('renders a list of cards if there are tutorials', async function (assert) {
    // given
    const tutorial1 = {
      title: 'Mon super tutoriel',
      link: 'https://exemple.net/',
      source: 'mon-tuto',
      format: 'vidéo',
      duration: '00:01:00',
      isEvaluated: true,
      isSaved: true,
    };

    const tutorial2 = {
      title: 'Mon deuxième super tutoriel',
      link: 'https://exemple2.net/',
      source: 'mon-tuto-2',
      format: 'vidéo',
      duration: '00:02:00',
      isEvaluated: true,
      isSaved: true,
    };
    const tutorials = [tutorial1, tutorial2];
    this.set('tutorials', tutorials);

    // when
    await render(hbs`<Tutorials::Cards @tutorials={{this.tutorials}} />`);

    // then
    assert.dom('.user-tutorials-content__cards').exists();
    assert.strictEqual(findAll('.tutorial-card').length, 2);
  });
});
