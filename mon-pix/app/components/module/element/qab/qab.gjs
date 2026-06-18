import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { trackedArray, trackedMap } from '@ember/reactive/collections';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import QabProposalButton from 'mon-pix/components/module/element/qab/proposal-button';
import QabCard from 'mon-pix/components/module/element/qab/qab-card';
import QabScoreCard from 'mon-pix/components/module/element/qab/qab-score-card';
import ModulixFeedback from 'mon-pix/components/module/feedback';

import { htmlUnsafe } from '../../../../helpers/html-unsafe';
import ModuleElement from '../module-element';

const NEXT_CARD_REMOVE_DELAY = 400;
const NEXT_CARD_TRANSITION_DELAY = 400;
export const NEXT_CARD_DELAY = NEXT_CARD_TRANSITION_DELAY + NEXT_CARD_REMOVE_DELAY;

export default class ModuleQab extends ModuleElement {
  @tracked selectedOption = null;
  @tracked currentStep = 'cards'; // 'cards' | 'score'
  @tracked currentCardStatus = '';
  @tracked currentCardIndex = 0;
  @tracked score = 0;
  @tracked displayedCards;
  @tracked cardStatuses = trackedMap();
  @tracked removedCards = trackedMap();
  @tracked reportInfo = {};

  @service passageEvents;

  constructor() {
    super(...arguments);
    this.displayedCards = trackedArray(this.element.cards);
  }

  get numberOfCards() {
    return this.element.cards.length;
  }

  get currentCard() {
    return this.displayedCards[0];
  }

  get shouldDisplayFeedback() {
    return this.shouldDisplayScore && this.element.feedback?.diagnosis.length > 0;
  }

  @action
  isProposalSolution(option) {
    return this.currentCard.solution === option;
  }

  @action
  isProposalSelected(option) {
    return this.selectedOption === option;
  }

  get isAnswered() {
    return this.selectedOption !== null;
  }

  @action
  async goToNextCard() {
    this.removedCards.set(this.currentCard.id, true);

    window.setTimeout(async () => {
      this.displayedCards.shift();
      this.currentCardStatus = '';
      this.selectedOption = null;
      document.activeElement.blur();

      if (this.displayedCards.length === 0) {
        this.currentStep = 'score';
        await this.onAnswer();
      }
    }, NEXT_CARD_REMOVE_DELAY);
  }

  @action
  async onAnswer() {
    await this.args.onAnswer({ element: this.element });
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    this.selectedOption = event.submitter.value;
    this.currentCardStatus = 'error';
    if (this.selectedOption === this.currentCard.solution) {
      this.score++;
      this.currentCardStatus = 'success';
    }

    this.cardStatuses.set(this.currentCard.id, this.currentCardStatus);
    window.setTimeout(async () => await this.goToNextCard(), NEXT_CARD_TRANSITION_DELAY);
    const status = this.currentCardStatus === 'success' ? 'ok' : 'ko';

    this.reportInfo = {
      answer: event.submitter.value,
      elementId: this.element.id,
    };

    this.passageEvents.record({
      type: 'QAB_CARD_ANSWERED',
      data: {
        cardId: this.currentCard.id,
        answer: event.submitter.value,
        status,
        elementId: this.element.id,
      },
    });
  }

  @action
  onRetry() {
    this.args.onRetry({ element: this.element });
    this.currentStep = 'cards';
    this.removedCards.clear();
    this.cardStatuses.clear();
    this.displayedCards = trackedArray(this.element.cards);
    this.score = 0;

    this.passageEvents.record({
      type: 'QAB_RETRIED',
      data: {
        elementId: this.element.id,
      },
    });
  }

  get shouldDisplayCards() {
    return this.currentStep === 'cards';
  }

  get shouldDisplayScore() {
    return this.currentStep === 'score';
  }

  @action
  getCardStatus(card) {
    return this.cardStatuses.get(card.id) || '';
  }

  @action
  isCardRemoved(card) {
    return this.removedCards.get(card.id) || false;
  }

  <template>
    <form onSubmit={{this.onSubmit}} class="element-qab" aria-describedby="instruction-{{this.element.id}}">
      <fieldset class="element-qab__container">
        <div class="element-qab__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </div>
        <div class="element-qab__cards">
          {{#if this.shouldDisplayCards}}
            {{#each this.displayedCards as |card|}}
              <QabCard @card={{card}} @isRemoved={{this.isCardRemoved card}} @status={{this.getCardStatus card}} />
            {{/each}}
          {{/if}}
          {{#if this.shouldDisplayScore}}
            <QabScoreCard @score={{this.score}} @total={{this.numberOfCards}} />
          {{/if}}
        </div>
        <div class="element-qab__proposals {{unless this.shouldDisplayCards 'element-qab__proposals--empty'}}">
          {{#if this.shouldDisplayCards}}
            <QabProposalButton
              @text={{this.currentCard.proposalA}}
              @option="A"
              @isSolution={{this.isProposalSolution "A"}}
              @isSelected={{this.isProposalSelected "A"}}
              @isDisabled={{this.isAnswered}}
            />
            <QabProposalButton
              @text={{this.currentCard.proposalB}}
              @option="B"
              @isSolution={{this.isProposalSolution "B"}}
              @isSelected={{this.isProposalSelected "B"}}
              @isDisabled={{this.isAnswered}}
            />
          {{/if}}
        </div>
      </fieldset>
    </form>

    {{#if this.shouldDisplayFeedback}}
      <ModulixFeedback
        @feedback={{this.element.feedback}}
        @reportInfo={{this.reportInfo}}
        @shouldDisplayRetryButton={{this.shouldDisplayScore}}
        @retry={{this.onRetry}}
      />
    {{else}}
      {{#if this.shouldDisplayScore}}
        <div class="element-qab__retry-button">
          <PixButton @variant="tertiary" @triggerAction={{this.onRetry}} @iconAfter="refresh">
            {{t "pages.modulix.qab.retry"}}
          </PixButton>
        </div>
      {{/if}}
    {{/if}}
  </template>
}
