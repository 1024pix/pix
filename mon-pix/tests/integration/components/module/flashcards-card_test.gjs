import { clickByName, render } from '@1024pix/ember-testing-library';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards/flashcards-card';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when recto is displayed', function () {
    test('should display the recto of given card', async function (assert) {
      // given
      const card = {
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
      };

      // when
      const screen = await render(
        <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" /></template>,
      );

      // then
      assert.ok(screen.getByText("A quoi sert l'arobase dans mon adresse email ?"));
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
    });

    module('when the recto image is not provided', function () {
      test('should not display image', async function (assert) {
        // given
        const card = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: { url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg' },
            text: "Parce que c'est joli",
          },
        };

        // when
        const screen = await render(
          <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" /></template>,
        );

        // then
        assert.dom(screen.queryByRole('img')).doesNotExist();
      });
    });

    module('when width and height are available', function () {
      test('should set them to the image', async function (assert) {
        // given
        const card = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            image: {
              url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
              information: { height: 400, width: 300 },
            },
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            text: "Parce que c'est joli",
          },
        };

        const expectedWidth = Math.round(
          (ModulixFlashcardsCard.MAX_HEIGHT * card.recto.image.information.width) / card.recto.image.information.height,
        );

        // when
        const screen = await render(
          <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" /></template>,
        );

        // then
        assert.dom(screen.getByRole('presentation')).hasAttribute('height', `${ModulixFlashcardsCard.MAX_HEIGHT}`);
        assert.dom(screen.getByRole('presentation')).hasAttribute('width', `${expectedWidth}`);
      });
    });
  });

  module('when verso is displayed', function () {
    test('should display the verso of given card', async function (assert) {
      // given
      const card = {
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
      };

      // when
      const screen = await render(
        <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="verso" /></template>,
      );

      // then
      assert.ok(screen.getByText("Parce que c'est joli"));
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAgain') })).exists();
    });

    module('when the verso image is not provided', function () {
      test('should not display image', async function (assert) {
        // given
        const card = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: { url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg' },
            text: "Parce que c'est joli",
          },
        };

        // when
        const screen = await render(
          <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" /></template>,
        );

        // then
        assert.dom(screen.queryByRole('img')).doesNotExist();
      });
    });

    module('when width and height are available', function () {
      test('should set them to the image', async function (assert) {
        // given
        const card = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: {
              url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
              information: { height: 400, width: 300 },
            },
            text: "Parce que c'est joli",
          },
        };

        const expectedWidth = Math.round(
          (ModulixFlashcardsCard.MAX_HEIGHT * card.verso.image.information.width) / card.verso.image.information.height,
        );

        // when
        const screen = await render(
          <template><ModulixFlashcardsCard @card={{card}} @displayedSideName="verso" /></template>,
        );

        // then
        assert.dom(screen.getByRole('presentation')).hasAttribute('height', `${ModulixFlashcardsCard.MAX_HEIGHT}`);
        assert.dom(screen.getByRole('presentation')).hasAttribute('width', `${expectedWidth}`);
      });
    });
  });

  module('when we click on "Voir la réponse"', function () {
    test('should call the onCardFlip method', async function (assert) {
      // given
      const card = {
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
      };
      const onCardFlipStub = sinon.stub();
      await render(
        <template>
          <ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" @onCardFlip={{onCardFlipStub}} />
        </template>,
      );

      // when
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));

      // then
      assert.true(onCardFlipStub.calledOnce);
    });
  });

  module('when we click on "Revoir la question"', function () {
    test('should call the onCardFlip method', async function (assert) {
      // given
      const card = {
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
      };
      const onCardFlipStub = sinon.stub();
      await render(
        <template>
          <ModulixFlashcardsCard @card={{card}} @displayedSideName="verso" @onCardFlip={{onCardFlipStub}} />
        </template>,
      );

      // when
      await clickByName(t('pages.modulix.buttons.flashcards.seeAgain'));

      // then
      assert.true(onCardFlipStub.calledOnce);
    });
  });
});
