import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards-card';
// eslint-disable-next-line no-restricted-imports
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
            url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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
        'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
    });

    test('should not display recto image if no one is provided', async function (assert) {
      // given
      const card = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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

  module('when verso is displayed', function () {
    test('should display the verso of given card', async function (assert) {
      // given
      const card = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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
        'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAgain') })).exists();
    });

    test('should not display verso image if no one is provided', async function (assert) {
      // given
      const card = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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

  module('when we click on "Voir la réponse"', function () {
    test('should call the onCardFlip method', async function (assert) {
      // given
      const card = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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
            url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
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
