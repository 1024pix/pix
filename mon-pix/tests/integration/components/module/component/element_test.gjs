import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixElement from 'mon-pix/components/module/component/element';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Element', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an element with an custom element', async function (assert) {
    // given
    const element = {
      id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
      type: 'custom',
      instruction: 'Instruction',
      tagName: 'qcu-image',
      props: {
        name: "Liste d'applications",
        maxChoicesPerLine: 3,
        imageChoicesSize: 'icon',
        choices: [
          {
            name: 'Google',
            image: {
              width: 534,
              height: 544,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
            },
          },
          {
            name: 'LibreOffice Writer',
            image: {
              width: 205,
              height: 246,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
            },
          },
          {
            name: 'Explorateur',
            image: {
              width: 128,
              height: 128,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
            },
          },
          {
            name: 'Geogebra',
            image: {
              width: 640,
              height: 640,
              loading: 'lazy',
              decoding: 'async',
              src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
            },
          },
        ],
      },
    };

    // when
    await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.strictEqual(findAll('.element-custom').length, 1);
    assert.strictEqual(findAll('qcu-image').length, 1);
  });

  test('should display an element with an custom-draft element', async function (assert) {
    // given
    const element = {
      id: 'f00133f5-0653-425b-a25f-3c9604820529',
      type: 'custom-draft',
      title: 'Retourner les cartes',
      url: 'https://1024pix.github.io/atelier-contenus/RPE/cartes2.html',
      instruction: '<p>Retournez les cartes.</p>',
      height: 400,
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.dom(screen.getByTitle(element.title)).exists();
  });

  test('should display an element with a text element', async function (assert) {
    // given
    const element = {
      id: '768441a5-a7d6-4987-ada9-7253adafd842',
      type: 'text',
      content: 'content',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.dom(screen.getByText(element.content)).exists();
  });

  test('should display an element with an image element', async function (assert) {
    // given
    const element = {
      id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
      type: 'image',
      url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
      alt: "Dessin détaillé dans l'alternative textuelle",
      alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert
      .dom(screen.getByRole('img', { name: "Dessin détaillé dans l'alternative textuelle" }))
      .exists()
      .hasAttribute('src', element.url);
    assert.dom(screen.getByRole('button', { name: "Afficher l'alternative textuelle" })).exists();
  });

  test('should display an element with an expand element', async function (assert) {
    // given
    const title = 'Expand title';
    const element = {
      id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
      type: 'expand',
      title,
      content: '<p>My content</p>',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    const detailsElement = screen.getByRole('group');
    assert.dom(detailsElement).exists();
  });

  test('should display an element with a video element', async function (assert) {
    // given
    const element = {
      id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
      type: 'video',
      title: 'Vidéo de présentation de Pix',
      url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
      subtitles: '',
      transcription: '<p>transcription</p>',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.strictEqual(findAll('.element-video').length, 1);
    assert.dom(screen.getByRole('button', { name: 'Afficher la transcription' })).exists();
  });

  test('should display an element with a short video element', async function (assert) {
    // given
    const element = {
      id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
      type: 'short-video',
      title: 'Vidéo courte de présentation de Pix',
      url: 'https://assets.pix.org/modules/placeholder-video.mp4',
      transcription: '<p>transcription</p>',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.strictEqual(findAll('.element-short-video').length, 1);
    assert.dom(screen.getByRole('button', { name: 'Afficher la transcription' })).exists();
  });

  test('should display an element with an audio element', async function (assert) {
    // given
    const element = {
      id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
      type: 'audio',
      title: 'Musique',
      url: 'https://assets.pix.org/modules/placeholder-audio.mp3',
      transcription: '<p>transcription</p>',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.strictEqual(findAll('.element-audio').length, 1);
    assert.dom(screen.getByRole('button', { name: 'Afficher la transcription' })).exists();
  });

  test('should display an element with an download element', async function (assert) {
    // given
    const element = {
      id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
      type: 'download',
      files: [
        {
          url: 'https://example.org/image.jpg',
          format: '.jpg',
        },
      ],
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    const downloadElement = screen.getByRole('link', {
      name: t('pages.modulix.download.label', { format: '.jpg' }),
    });
    assert.dom(downloadElement).hasText(t('pages.modulix.download.button'));
  });

  test('should display an element with an embed element', async function (assert) {
    // given
    const element = {
      id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
      type: 'embed',
      title: 'Embed de présentation de Pix',
      url: 'https://embed.pix.fr',
      height: 340,
      isCompletionRequired: false,
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.dom(screen.getByTitle(element.title)).exists();
  });

  test('should display an element with a separator element', async function (assert) {
    // given
    const element = {
      id: '11f382f1-d36a-48d2-a99d-4aa052ab7841',
      type: 'separator',
    };

    // when
    await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.dom('hr').exists();
  });

  test('should display an element with a qcu element', async function (assert) {
    // given
    const element = {
      id: 'd0690f26-978c-41c3-9a21-da931857739c',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'radio1' },
        { id: '2', content: 'radio2' },
      ],
      type: 'qcu',
    };
    const getLastCorrectionForElementStub = () => {};

    // when
    const screen = await render(
      <template>
        <ModulixElement @element={{element}} @getLastCorrectionForElement={{getLastCorrectionForElementStub}} />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).exists();
  });

  test('should display an element with a qcu declarative element', async function (assert) {
    // given
    const element = {
      id: 'd0690f26-978c-41c3-9a21-da931857739c',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'prop1' },
        { id: '2', content: 'prop2' },
      ],
      type: 'qcu-declarative',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.ok(screen.getByText('Il n’y a pas de bonne ou de mauvaise réponse.'));
    assert.ok(screen.getByRole('button', { name: element.proposals[0].content }));
  });

  test('should display an element with a qcu discovery element', async function (assert) {
    // given
    const element = {
      id: '0c397035-a940-441f-8936-050db7f997af',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'prop1' },
        { id: '2', content: 'prop2' },
      ],
      solution: '1',
      type: 'qcu-discovery',
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.deepEqual(screen.getAllByText('Sélectionnez la réponse qui vous semble la plus juste.').length, 2);
    assert.ok(screen.getByRole('button', { name: element.proposals[0].content }));
  });

  test('should display an element with a qcm element', async function (assert) {
    // given
    const element = {
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      type: 'qcm',
    };
    const getLastCorrectionForElementStub = () => {};

    // when
    const screen = await render(
      <template>
        <ModulixElement @element={{element}} @getLastCorrectionForElement={{getLastCorrectionForElementStub}} />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).exists();
  });

  test('should display an element with a qrocm element', async function (assert) {
    // given
    const element = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        { content: '<span>Ma première proposition</span>', type: 'text' },
        {
          input: 'symbole',
          inputType: 'text',
          display: 'inline',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          defaultValue: '',
          type: 'input',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'select-aria',
          defaultValue: '',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocm',
    };
    const getLastCorrectionForElementStub = () => {};

    // when
    const screen = await render(
      <template>
        <ModulixElement @element={{element}} @getLastCorrectionForElement={{getLastCorrectionForElementStub}} />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).exists();
  });

  test('should display an element with a flashcards element', async function (assert) {
    // given
    const element = {
      id: '71de6394-ff88-4de3-8834-a40057a50ff4',
      type: 'flashcards',
      title: "Introduction à l'adresse e-mail",
      instruction: '<p>...</p>',
      introImage: { url: 'https://assets.pix.org/modules/placeholder-details.svg' },
      cards: [
        {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            image: {
              url: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
            },
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: { url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg' },
            text: "Parce que c'est joli",
          },
        },
      ],
    };
    const getLastCorrectionForElementStub = () => {};

    // when
    const screen = await render(
      <template>
        <ModulixElement @element={{element}} @getLastCorrectionForElement={{getLastCorrectionForElementStub}} />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Commencer' })).exists();
  });

  test('should display an element with a qab element', async function (assert) {
    // given
    const element = {
      id: 'ed795d29-5f04-499c-a9c8-4019125c5cb1',
      type: 'qab',
      instruction:
        '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>',
      cards: [
        {
          id: 'e222b060-7c18-4ee2-afe2-2ae27c28946a',
          image: {
            url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
            altText: '',
          },
          text: 'Les boules de pétanques sont creuses.',
          proposalA: 'Vrai',
          proposalB: 'Faux',
          solution: 'A',
        },
      ],
    };

    // when
    const screen = await render(<template><ModulixElement @element={{element}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).exists();
  });
});
