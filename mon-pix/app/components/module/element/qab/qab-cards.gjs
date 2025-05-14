import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModulixQabCard from 'mon-pix/components/module/element/qab/qab-cards-card';
import ModulixQabOutroCard from 'mon-pix/components/module/element/qab/qab-cards-outro-card';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

const INITIAL_COUNTERS_VALUE = { yes: 0, almost: 0, no: 0 };

export default class ModulixQuestionABCards extends Component {
  @service passageEvents;

  @tracked
  /**
   * Displayed side of the card on the screen
   * @type {"cards"|"outro"}
   */
  currentStep = 'cards';

  @tracked
  /**
   * Displayed state of the card on the screen
   * @type {"question"|"feedback"}
   */
  displayedStateName = 'question';

  @tracked
  /**
   * Result of the answer
   * @type {"success"|"error"}
   */
  cardResult = 'success';

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
    return this.args.cards.questions[this.currentCardIndex];
  }

  get currentCardNumber() {
    return this.currentCardIndex + 1;
  }

  get numberOfCards() {
    return this.args.cards.questions.length;
  }

  get footerIsEmpty() {
    return this.currentStep === 'outro';
  }

  get shouldDisplayOutroCard() {
    return this.currentStep === 'outro';
  }

  @action
  start() {
    this.currentStep = 'cards';
  }

  @action
  flipCard(proposalId) {
    this.cardResult = this.currentCard.solution === proposalId ? 'success' : 'error';

    this.displayedStateName = this.displayedStateName === 'question' ? 'feedback' : 'question';

    setTimeout(() => {
      this.goToNextCard();

      const elementToFocus = document.querySelector('.element-qab-cards');
      elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
    }, 2_000);
  }

  incrementCounterFor(userAssessment) {
    this.counters[userAssessment]++;
  }

  goToNextCard() {
    if (this.currentCardIndex < this.numberOfCards - 1) {
      this.currentCardIndex++;
      this.displayedStateName = 'question';
    } else {
      this.currentStep = 'outro';
    }
  }

  @action
  noop() {}

  @action
  onSelfAssessment(userAssessment) {
    const selfAssessmentData = {
      userAssessment,
      cardId: this.currentCard.id,
    };
    this.args.onSelfAssessment(selfAssessmentData);

    this.incrementCounterFor(userAssessment);
  }

  <template>
    <div class="element-qab-cards__instruction">
      {{htmlUnsafe @cards.instruction}}
    </div>
    <form class="element-qab-cards">
      {{#if (eq this.currentStep "cards")}}
        <ModulixQabCard
          @card={{this.currentCard}}
          @displayedStateName={{this.displayedStateName}}
          @cardResult={{this.cardResult}}
          @onCardFlip={{this.flipCard}}
        />
      {{/if}}

      {{#if this.shouldDisplayOutroCard}}
        <ModulixQabOutroCard @title={{@cards.title}} @onRetry={{this.retry}} @counters={{this.counters}} />
      {{/if}}

      <div class="element-qab-cards__footer {{if this.footerIsEmpty 'element-qab-cards__footer--empty'}}">
        {{#if (eq this.currentStep "cards")}}
          {{#if (eq this.displayedStateName "question")}}{{/if}}
          {{#if (eq this.displayedStateName "feedback")}}{{/if}}
        {{/if}}
      </div>
    </form>
  </template>
}
