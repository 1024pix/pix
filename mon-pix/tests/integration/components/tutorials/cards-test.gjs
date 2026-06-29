import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import Cards from 'mon-pix/components/tutorials/cards';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Cards', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders no cards if there are no tutorials', async function (assert) {
    // given
    const tutorials = [];

    // when
    await render(<template><Cards @tutorials={{tutorials}} /></template>);

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

    // when
    await render(<template><Cards @tutorials={{tutorials}} /></template>);

    // then
    assert.dom('.user-tutorials-content__cards').exists();
    assert.strictEqual(findAll('.tutorial-card').length, 2);
  });
});
