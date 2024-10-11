import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModulixFlashcards from 'mon-pix/components/module/element/flashcards/flashcards';
// eslint-disable-next-line no-restricted-imports
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the intro card by default', async function (assert) {
    // given
    const firstCard = {
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
    const secondCard = {
      id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
      recto: {
        image: {
          url: 'https://images.pix.fr/modulix/didacticiel/icon.svg',
        },
        text: 'Qui a écrit le Dormeur du Val ?',
      },
      verso: {
        image: {
          url: 'https://images.pix.fr/modulix/didacticiel/chaton.jpg',
        },
        text: '<p>Arthur Rimbaud</p>',
      },
    };

    const flashcards = {
      id: '71de6394-ff88-4de3-8834-a40057a50ff4',
      type: 'flashcards',
      title: "Introduction à l'adresse e-mail",
      instruction: '<p>...</p>',
      introImage: { url: 'https://images.pix.fr/modulix/flashcards-intro.png' },
      cards: [firstCard, secondCard],
    };

    // when
    const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

    // then
    assert.ok(screen.getByText("Introduction à l'adresse e-mail"));
    assert.strictEqual(
      screen.getByRole('presentation').getAttribute('src'),
      'https://images.pix.fr/modulix/flashcards-intro.png',
    );
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') })).exists();
    assert.dom(screen.queryByText(t('pages.modulix.flashcards.direction'))).doesNotExist();
    assert
      .dom(screen.queryByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 2 })))
      .doesNotExist();
  });

  module('when user clicks on the "Start" button', function () {
    test('should display the first card', async function (assert) {
      // given
      const firstCard = {
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
      const secondCard = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://images.pix.fr/modulix/didacticiel/icon.svg',
          },
          text: 'Qui a écrit le Dormeur du Val ?',
        },
        verso: {
          image: {
            url: 'https://images.pix.fr/modulix/didacticiel/chaton.jpg',
          },
          text: '<p>Arthur Rimbaud</p>',
        },
      };

      const flashcards = {
        id: '71de6394-ff88-4de3-8834-a40057a50ff4',
        type: 'flashcards',
        title: "Introduction à l'adresse e-mail",
        instruction: '<p>...</p>',
        introImage: { url: 'https://images.pix.fr/modulix/placeholder-details.svg' },
        cards: [firstCard, secondCard],
      };

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
      await clickByName(t('pages.modulix.buttons.flashcards.start'));

      // then
      assert.ok(screen.getByText("A quoi sert l'arobase dans mon adresse email ?"));
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
      assert.ok(screen.getByText(t('pages.modulix.flashcards.direction')));
      assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 2 })));
    });
  });

  module('when users clicks on the "Continue" button', function () {
    test('should display options buttons to answer', async function (assert) {
      // given
      const firstCard = {
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
      const secondCard = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://images.pix.fr/modulix/didacticiel/icon.svg',
          },
          text: 'Qui a écrit le Dormeur du Val ?',
        },
        verso: {
          image: {
            url: 'https://images.pix.fr/modulix/didacticiel/chaton.jpg',
          },
          text: '<p>Arthur Rimbaud</p>',
        },
      };

      const flashcards = {
        id: '71de6394-ff88-4de3-8834-a40057a50ff4',
        type: 'flashcards',
        title: "Introduction à l'adresse e-mail",
        instruction: '<p>...</p>',
        introImage: { url: 'https://images.pix.fr/modulix/placeholder-details.svg' },
        cards: [firstCard, secondCard],
      };

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
      await clickByName(t('pages.modulix.buttons.flashcards.start'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));

      // then
      assert.ok(screen.getByText(t('pages.modulix.flashcards.answerDirection')));
      assert.ok(screen.getByText(t('pages.modulix.buttons.flashcards.answers.notAtAll')));
    });

    module('then user gives an answer', function () {
      test('should display the next card and send answer', async function (assert) {
        // given
        const firstCard = {
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
        const secondCard = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            image: {
              url: 'https://images.pix.fr/modulix/didacticiel/icon.svg',
            },
            text: 'Qui a écrit le Dormeur du Val ?',
          },
          verso: {
            image: {
              url: 'https://images.pix.fr/modulix/didacticiel/chaton.jpg',
            },
            text: '<p>Arthur Rimbaud</p>',
          },
        };

        const flashcards = {
          id: '71de6394-ff88-4de3-8834-a40057a50ff4',
          type: 'flashcards',
          title: "Introduction à l'adresse e-mail",
          instruction: '<p>...</p>',
          introImage: { url: 'https://images.pix.fr/modulix/placeholder-details.svg' },
          cards: [firstCard, secondCard],
        };

        const onFlashcardsAnswerStub = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ModulixFlashcards @flashcards={{flashcards}} @onFlashcardsAnswer={{onFlashcardsAnswerStub}} />
          </template>,
        );
        await clickByName(t('pages.modulix.buttons.flashcards.start'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.notAtAll'));

        // then
        assert.ok(screen.getByText('Qui a écrit le Dormeur du Val ?'));
        assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 2, totalCards: 2 })));
        assert.true(onFlashcardsAnswerStub.calledOnce);
      });
    });
  });
});
