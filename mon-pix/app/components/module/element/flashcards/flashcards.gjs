import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards/flashcards-card';
import ModulixFlashcardsIntroCard from 'mon-pix/components/module/element/flashcards/flashcards-intro-card';

export default class ModulixFlashcards extends Component {
  @tracked
  /**
   * Displayed side of the card on the screen
   * @type {"intro"|"cards"|"outro"}
   */
  currentStep = 'intro';

  @tracked
  /**
   * Displayed side of the card on the screen
   * @type {"recto"|"verso"}
   */
  displayedSideName = 'recto';

  @tracked
  /**
   * Index of the displayed card in the deck
   * @type {number}
   */
  currentCardIndex = 0;

  get currentCard() {
    return this.args.flashcards.cards[this.currentCardIndex];
  }

  get currentCardNumber() {
    return this.currentCardIndex + 1;
  }

  get numberOfCards() {
    return this.args.flashcards.cards.length;
  }

  @action
  start() {
    this.currentStep = 'cards';
  }

  @action
  flipCard() {
    this.displayedSideName = this.displayedSideName === 'recto' ? 'verso' : 'recto';
  }

  goToNextCard() {
    this.currentCardIndex++;
    this.displayedSideName = 'recto';
  }

  @action
  onAnswer() {
    this.args.onFlashcardsAnswer();
    this.goToNextCard();
  }

  <template>
    <div class="element-flashcards">

      {{#if (eq this.currentStep "intro")}}
        <ModulixFlashcardsIntroCard
          @title={{@flashcards.title}}
          @introImage={{@flashcards.introImage}}
          @onStart={{this.start}}
        />
      {{/if}}

      {{#if (eq this.currentStep "cards")}}
        <ModulixFlashcardsCard
          @card={{this.currentCard}}
          @displayedSideName={{this.displayedSideName}}
          @onCardFlip={{this.flipCard}}
        />

        <div class="element-flashcards__footer">
          {{#if (eq this.displayedSideName "recto")}}
            <p class="element-flashcards__footer__direction">{{t "pages.modulix.flashcards.direction"}}</p>
            <p class="element-flashcards__footer__position">{{t
                "pages.modulix.flashcards.position"
                currentCardPosition=this.currentCardNumber
                totalCards=this.numberOfCards
              }}</p>
          {{/if}}
          {{#if (eq this.displayedSideName "verso")}}
            <p class="element-flashcards__footer__question">{{t "pages.modulix.flashcards.answerDirection"}}</p>
            <div class="element-flashcards__footer__answer">
              <button
                class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--no"
                type="button"
                {{on "click" this.onAnswer}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.notAtAll"}}
              </button>
              <button
                class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--almost"
                type="button"
                {{on "click" this.onAnswer}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.almost"}}
              </button>
              <button
                class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--yes"
                type="button"
                {{on "click" this.onAnswer}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.yes"}}
              </button>
            </div>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
