import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import ModulixStep from 'mon-pix/components/module/step';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Step', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('unique element', function () {
    test('should display a step with a text element', async function (assert) {
      // given
      const element = {
        id: '768441a5-a7d6-4987-ada9-7253adafd842',
        type: 'text',
        content: 'content',
      };
      const step = {
        elements: [element],
      };

      // when
      const screen = await render(<template><ModulixStep @step={{step}} /></template>);

      // then
      assert.dom(screen.getByText(element.content)).exists();
    });

    test('should display a step with an image element', async function (assert) {
      // given
      const element = {
        id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
        type: 'image',
        url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
        alt: "Dessin détaillé dans l'alternative textuelle",
        alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
      };
      const step = {
        elements: [element],
      };

      // when
      const screen = await render(<template><ModulixStep @step={{step}} /></template>);

      // then
      assert
        .dom(screen.getByRole('img', { name: "Dessin détaillé dans l'alternative textuelle" }))
        .exists()
        .hasAttribute('src', element.url);
      assert.dom(screen.getByRole('button', { name: "Afficher l'alternative textuelle" })).exists();
    });

    test('should display a step with a video element', async function (assert) {
      // given
      const element = {
        id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
        type: 'video',
        title: 'Vidéo de présentation de Pix',
        url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
        subtitles: '',
        transcription: '<p>transcription</p>',
      };
      const step = {
        elements: [element],
      };

      // when
      const screen = await render(<template><ModulixStep @step={{step}} /></template>);

      // then
      assert.strictEqual(findAll('.element-video').length, 1);
      assert.dom(screen.getByRole('button', { name: 'Afficher la transcription' })).exists();
    });
  });
});
