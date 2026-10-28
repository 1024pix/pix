import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards/flashcards-card';
import ModulixFlashcardsIntroCard from 'mon-pix/components/module/element/flashcards/flashcards-intro-card';
import ModulixFlashcardsOutroCard from 'mon-pix/components/module/element/flashcards/flashcards-outro-card';
import RichContent from 'mon-pix/components/module/rich-content';

const INITIAL_COUNTERS_VALUE = { yes: 0, almost: 0, no: 0 };

export default class ModulixFlashcards extends Component {
  @service modulixPreviewMode;
  @service passageEvents;

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

  @tracked
  /**
   * Stores the number of times an answer has been chosen
   * @type {object}
   */
  counters = { ...INITIAL_COUNTERS_VALUE };

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

  get shouldDisplayIntroCard() {
    return this.currentStep === 'intro' || this.modulixPreviewMode.isEnabled;
  }

  get shouldDisplayOutroCard() {
    return this.currentStep === 'outro' || this.modulixPreviewMode.isEnabled;
  }

  @action
  retry() {
    this.args.onRetry({ element: this.args.flashcards });
    this.currentStep = 'intro';
    this.currentCardIndex = 0;
    this.displayedSideName = 'recto';
    this.counters = { ...INITIAL_COUNTERS_VALUE };

    this.passageEvents.record({
      type: 'FLASHCARDS_RETRIED',
      data: {
        elementId: this.args.flashcards.id,
      },
    });
  }

  @action
  start() {
    this.currentStep = 'cards';

    this.passageEvents.record({
      type: 'FLASHCARDS_STARTED',
      data: {
        elementId: this.args.flashcards.id,
      },
    });
  }

  @action
  flipCard() {
    this.displayedSideName = this.displayedSideName === 'recto' ? 'verso' : 'recto';
    const eventType = this.displayedSideName === 'recto' ? 'FLASHCARDS_RECTO_REVIEWED' : 'FLASHCARDS_VERSO_SEEN';
    this.passageEvents.record({
      type: eventType,
      data: {
        cardId: this.currentCard.id,
        elementId: this.args.flashcards.id,
      },
    });
  }

  incrementCounterFor(userAssessment) {
    this.counters[userAssessment]++;
  }

  async goToNextCard() {
    if (this.currentCardIndex < this.numberOfCards - 1) {
      this.currentCardIndex++;
      this.displayedSideName = 'recto';
    } else {
      this.currentStep = 'outro';
      await this.onAnswer();
    }
  }

  @action
  async onAnswer() {
    await this.args.onAnswer({ element: this.args.flashcards });
  }

  @action
  noop() {}

  @action
  async onSelfAssessment(userAssessment) {
    this.passageEvents.record({
      type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
      data: {
        autoAssessment: userAssessment,
        cardId: this.currentCard.id,
        elementId: this.args.flashcards.id,
      },
    });

    this.incrementCounterFor(userAssessment);
    await this.goToNextCard();

    const elementToFocus = document.querySelector('.element-flashcards');
    elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  <template>
    <div class="element-flashcards__instruction">
      <RichContent @html={{@flashcards.instruction}} />
    </div>
    <div class="element-flashcards">
      {{#if this.modulixPreviewMode.isEnabled}}
        <ModulixFlashcardsIntroCard
          @title={{@flashcards.title}}
          @introImage={{@flashcards.introImage}}
          @onStart={{this.noop}}
        />

        {{#each @flashcards.cards as |card|}}
          <div class="element-flashcards__recto-verso">
            <ModulixFlashcardsCard @card={{card}} @displayedSideName="recto" @onCardFlip={{this.noop}} />
            <ModulixFlashcardsCard @card={{card}} @displayedSideName="verso" @onCardFlip={{this.noop}} />
          </div>
        {{/each}}

        <ModulixFlashcardsOutroCard @title={{@flashcards.title}} @onRetry={{this.noop}} @counters={{this.counters}} />
      {{else}}
        {{#if this.shouldDisplayIntroCard}}
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

        {{#if this.shouldDisplayOutroCard}}
          <ModulixFlashcardsOutroCard
            @title={{@flashcards.title}}
            @onRetry={{this.retry}}
            @counters={{this.counters}}
          />
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
                  class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--yes"
                  type="button"
                  {{on "click" (fn this.onSelfAssessment "yes")}}
                >
                  {{t "pages.modulix.buttons.flashcards.answers.yes"}}
                </button>
                <button
                  class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--almost"
                  type="button"
                  {{on "click" (fn this.onSelfAssessment "almost")}}
                >
                  {{t "pages.modulix.buttons.flashcards.answers.almost"}}
                </button>
                <button
                  class="element-flashcards__footer__answer__button element-flashcards__footer__answer__button--no"
                  type="button"
                  {{on "click" (fn this.onSelfAssessment "no")}}
                >
                  {{t "pages.modulix.buttons.flashcards.answers.no"}}
                </button>
              </div>
            {{/if}}
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
