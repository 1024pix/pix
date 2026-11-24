import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import ModulixFlashcards from 'mon-pix/components/module/element/flashcards/flashcards';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards', function (hooks) {
  setupIntlRenderingTest(hooks);

  let passageEventsService;

  hooks.beforeEach(async function () {
    passageEventsService = this.owner.lookup('service:passage-events');
    passageEventsService.record = sinon.stub();
  });

  test('should display provided instructions about Flashcards', async function (assert) {
    // given
    const { flashcards } = _getFlashcards();

    // when
    const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

    // then
    assert.ok(
      screen.getByText('Lisez la question, essayez de trouver la réponse puis retourner la carte en cliquant dessus'),
    );
  });

  test('should display the intro card by default', async function (assert) {
    // given
    const { flashcards } = _getFlashcards();

    // when
    const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: "Introduction à l'adresse e-mail", level: 4 }));
    assert.strictEqual(
      screen.getByRole('presentation').getAttribute('src'),
      'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
    );
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') })).exists();
    assert.dom(screen.queryByText(t('pages.modulix.flashcards.direction'))).doesNotExist();
    assert
      .dom(screen.queryByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 2 })))
      .doesNotExist();
  });

  module('when in preview mode', function () {
    test('should display all sides of all cards', async function (assert) {
      // given
      const { flashcards, firstCard, secondCard } = _getFlashcards();

      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

      // then
      const introCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') });
      assert.dom(introCardButton).exists();

      assert.dom(screen.getByText(firstCard.recto.text)).exists();
      assert.dom(screen.getByText(firstCard.verso.text)).exists();
      assert.dom(screen.getByText(secondCard.recto.text)).exists();
      assert.dom(screen.getByText(secondCard.verso.text)).exists();

      const outroCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.retry') });
      assert.dom(outroCardButton).exists();

      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.no') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.almost') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.yes') }))
        .doesNotExist();
    });

    test('should not display new flashcard on "Start" button click', async function (assert) {
      // given
      const { flashcards, firstCard, secondCard } = _getFlashcards();

      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

      // then
      const introCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') });
      assert.dom(introCardButton).exists();
      await click(introCardButton);

      assert.dom(screen.getByText(firstCard.recto.text)).exists();
      assert.dom(screen.getByText(firstCard.verso.text)).exists();
      assert.dom(screen.getByText(secondCard.recto.text)).exists();
      assert.dom(screen.getByText(secondCard.verso.text)).exists();

      const outroCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.retry') });
      assert.dom(outroCardButton).exists();

      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.no') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.almost') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.yes') }))
        .doesNotExist();
    });

    test('should not display return on intro card on "Retry" button click', async function (assert) {
      // given
      const { flashcards, firstCard, secondCard } = _getFlashcards();

      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

      // then
      const outroCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.retry') });
      assert.dom(outroCardButton).exists();
      await click(outroCardButton);

      assert.dom(outroCardButton).exists();

      const introCardButton = screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') });
      assert.dom(introCardButton).exists();

      assert.dom(screen.getByText(firstCard.recto.text)).exists();
      assert.dom(screen.getByText(firstCard.verso.text)).exists();
      assert.dom(screen.getByText(secondCard.recto.text)).exists();
      assert.dom(screen.getByText(secondCard.verso.text)).exists();

      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.no') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.almost') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.flashcards.answers.yes') }))
        .doesNotExist();
    });
  });

  module('when user clicks on the "Start" button', function () {
    test('should display the first card and record a FLASHCARDS_STARTED event', async function (assert) {
      // given
      const { flashcards } = _getFlashcards();

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
      await clickByName(t('pages.modulix.buttons.flashcards.start'));

      // then
      assert.ok(screen.getByText("A quoi sert l'arobase dans mon adresse email ?"));
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      );
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
      assert.ok(screen.getByText(t('pages.modulix.flashcards.direction')));
      assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 2 })));
      assert.ok(
        passageEventsService.record.calledWith({
          type: 'FLASHCARDS_STARTED',
          data: { elementId: '71de6394-ff88-4de3-8834-a40057a50ff4' },
        }),
      );
    });
  });

  module('when users clicks on the "Continue" button', function () {
    test('should display options buttons to answer and send a flashcards verso seen event', async function (assert) {
      // given
      const { flashcards } = _getFlashcards();

      // when
      const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
      await clickByName(t('pages.modulix.buttons.flashcards.start'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));

      // then
      assert.ok(screen.getByText(t('pages.modulix.flashcards.answerDirection')));
      assert.ok(screen.getByText(t('pages.modulix.buttons.flashcards.answers.no')));

      assert.ok(
        passageEventsService.record.calledWith({
          type: 'FLASHCARDS_VERSO_SEEN',
          data: { cardId: 'e1de6394-ff88-4de3-8834-a40057a50ff4', elementId: '71de6394-ff88-4de3-8834-a40057a50ff4' },
        }),
      );
    });

    module('when the user self-assesses their response', function () {
      test('should display the next card and send self-assessment event', async function (assert) {
        // given
        const { flashcards } = _getFlashcards();

        // when
        const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
        await clickByName(t('pages.modulix.buttons.flashcards.start'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.no'));

        // then
        assert.ok(screen.getByText('Qui a écrit le Dormeur du Val ?'));
        assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 2, totalCards: 2 })));
        assert.ok(
          passageEventsService.record.calledWith({
            type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
            data: {
              autoAssessment: 'no',
              cardId: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
              elementId: '71de6394-ff88-4de3-8834-a40057a50ff4',
            },
          }),
        );
      });
    });

    module('then user gives an answer for the last card', function () {
      test('should display the outro card and call "onAnswer" function passed as argument', async function (assert) {
        // given
        const { flashcards } = _getFlashcards();

        const onAnswerStub = sinon.stub();

        // when
        const screen = await render(
          <template><ModulixFlashcards @flashcards={{flashcards}} @onAnswer={{onAnswerStub}} /></template>,
        );
        await clickByName(t('pages.modulix.buttons.flashcards.start'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.no'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.yes'));

        // then
        sinon.assert.calledWithExactly(onAnswerStub, {
          element: flashcards,
        });

        assert.ok(screen.getByText('Terminé'));
      });
    });
  });

  module('when user clicks on "See again" button', function () {
    test('should send a flashcards recto reviewed event', async function (assert) {
      // given
      const { flashcards } = _getFlashcards();

      // when
      await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);
      await clickByName(t('pages.modulix.buttons.flashcards.start'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAgain'));

      // then
      assert.ok(
        passageEventsService.record.calledWith({
          type: 'FLASHCARDS_RECTO_REVIEWED',
          data: { cardId: 'e1de6394-ff88-4de3-8834-a40057a50ff4', elementId: '71de6394-ff88-4de3-8834-a40057a50ff4' },
        }),
      );
    });
  });

  module('when users reaches the end of the deck', function () {
    test('should display the counters for each answer', async function (assert) {
      // given
      const { flashcards } = _getFlashcards();

      const onAnswerStub = sinon.stub();

      // when
      const screen = await render(
        <template><ModulixFlashcards @flashcards={{flashcards}} @onAnswer={{onAnswerStub}} /></template>,
      );
      await clickByName(t('pages.modulix.buttons.flashcards.start'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
      await clickByName(t('pages.modulix.buttons.flashcards.answers.yes'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
      await clickByName(t('pages.modulix.buttons.flashcards.answers.no'));

      // then
      assert.ok(screen.getByText('Oui ! : 1'));
      assert.ok(screen.getByText('Presque : 0'));
      assert.ok(screen.getByText('Pas du tout : 1'));
    });
  });

  module('when user clicks on the "Retry" button', function () {
    test('should display intro card and send flashcards retried event', async function (assert) {
      // given
      const { flashcards } = _getFlashcards();

      const onAnswerStub = sinon.stub();
      const onRetrySpy = sinon.spy();

      // when
      const screen = await render(
        <template>
          <ModulixFlashcards @flashcards={{flashcards}} @onAnswer={{onAnswerStub}} @onRetry={{onRetrySpy}} />
        </template>,
      );
      await clickByName(t('pages.modulix.buttons.flashcards.start'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
      await clickByName(t('pages.modulix.buttons.flashcards.answers.yes'));
      await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
      await clickByName(t('pages.modulix.buttons.flashcards.answers.no'));
      await clickByName(t('pages.modulix.buttons.flashcards.retry'));

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') })).exists();
      assert.ok(onRetrySpy.calledOnceWithExactly({ element: flashcards }));
      assert.ok(
        passageEventsService.record.calledWithExactly({
          type: 'FLASHCARDS_RETRIED',
          data: { elementId: flashcards.id },
        }),
      );
    });

    module('when user click on the "start" button', function () {
      test('displays the first flashcard', async function (assert) {
        // given
        const { flashcards, firstCard } = _getFlashcards();

        const onAnswerStub = sinon.stub();
        const onRetryStub = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ModulixFlashcards @flashcards={{flashcards}} @onAnswer={{onAnswerStub}} @onRetry={{onRetryStub}} />
          </template>,
        );
        await clickByName(t('pages.modulix.buttons.flashcards.start'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.yes'));
        await clickByName(t('pages.modulix.buttons.flashcards.seeAnswer'));
        await clickByName(t('pages.modulix.buttons.flashcards.answers.yes'));
        await clickByName(t('pages.modulix.buttons.flashcards.retry'));
        await clickByName(t('pages.modulix.buttons.flashcards.start'));

        // then
        assert.ok(screen.getByText(firstCard.recto.text));
        assert.strictEqual(screen.getByRole('presentation').getAttribute('src'), firstCard.recto.image.url);
        assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
        assert.ok(screen.getByText(t('pages.modulix.flashcards.direction')));
        assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 2 })));
      });
    });
  });
});

function _getFlashcards() {
  const firstCard = {
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
  const secondCard = {
    id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
    recto: {
      image: {
        url: 'https://assets.pix.org/modules/didacticiel/icon.svg',
      },
      text: 'Qui a écrit le Dormeur du Val ?',
    },
    verso: {
      image: {
        url: 'https://assets.pix.org/modules/didacticiel/chaton.jpg',
      },
      text: 'Arthur Rimbaud',
    },
  };

  const flashcards = {
    id: '71de6394-ff88-4de3-8834-a40057a50ff4',
    type: 'flashcards',
    title: "Introduction à l'adresse e-mail",
    instruction: 'Lisez la question, essayez de trouver la réponse puis retourner la carte en cliquant dessus',
    introImage: { url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg' },
    cards: [firstCard, secondCard],
  };

  return { flashcards, firstCard, secondCard };
}
