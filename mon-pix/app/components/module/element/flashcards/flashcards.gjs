import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards/flashcards-card';
import ModulixFlashcardsIntroCard from 'mon-pix/components/module/element/flashcards/flashcards-intro-card';
import ModulixFlashcardsOutroCard from 'mon-pix/components/module/element/flashcards/flashcards-outro-card';

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

  get footerIsEmpty() {
    return this.currentStep === 'intro' || this.currentStep === 'outro';
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
  onSelfAssessment(userAssessment) {
    const selfAssessmentData = {
      userAssessment,
      cardId: this.currentCard.id,
    };
    this.args.onSelfAssessment(selfAssessmentData);
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
      {{/if}}

      {{#if (eq this.currentStep "outro")}}
        <ModulixFlashcardsOutroCard @title={{@flashcards.title}} @onRetry={{this.retry}} />
      {{/if}}

      <div class="element-flashcards__footer {{if this.footerIsEmpty 'element-flashcards__footer--empty'}}">
        {{#if (eq this.currentStep "cards")}}
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
                {{on "click" (fn this.onSelfAssessment "no")}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.notAtAll"}}
              </button>
              <button
                class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--almost"
                type="button"
                {{on "click" (fn this.onSelfAssessment "almost")}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.almost"}}
              </button>
              <button
                class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--yes"
                type="button"
                {{on "click" (fn this.onSelfAssessment "yes")}}
              >
                {{t "pages.modulix.buttons.flashcards.answers.yes"}}
              </button>
            </div>
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
