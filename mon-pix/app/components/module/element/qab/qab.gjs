import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import QabProposalButton from 'mon-pix/components/module/element/qab/proposal-button';
import QabCard from 'mon-pix/components/module/element/qab/qab-card';
import QabScoreCard from 'mon-pix/components/module/element/qab/qab-score-card';

import { htmlUnsafe } from '../../../../helpers/html-unsafe';
import ModuleElement from '../module-element';

export const NEXT_CARD_DELAY = 1000;

export default class ModuleQab extends ModuleElement {
  @tracked selectedOption = null;
  @tracked currentStep = 'cards'; // 'cards' | 'score'
  @tracked currentCardStatus = '';
  @tracked currentCardIndex = 0;
  @tracked answeredCardIndexes = [];
  @tracked score = 0;

  get numberOfCards() {
    return this.element.cards.length;
  }

  get currentCard() {
    return this.element.cards[this.currentCardIndex];
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

  markCurrentCardAsAnswered() {
    this.answeredCardIndexes = [...this.answeredCardIndexes, this.currentCardIndex];
  }

  @action
  goToNextCard() {
    this.currentCardIndex = this.currentCardIndex + 1;
    this.currentCardStatus = '';
    this.selectedOption = null;

    if (this.currentCardIndex >= this.numberOfCards) {
      this.currentStep = 'score';
    }
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.selectedOption = event.submitter.value;
    this.currentCardStatus = 'error';
    if (this.selectedOption === this.currentCard.solution) {
      this.score++;
      this.currentCardStatus = 'success';
    }
    const nextCardTransitionDelay = NEXT_CARD_DELAY + 100 * this.getCardZIndex(this.currentCardIndex);
    window.setTimeout(() => this.markCurrentCardAsAnswered(), NEXT_CARD_DELAY);
    window.setTimeout(() => this.goToNextCard(), nextCardTransitionDelay);
  }

  @action
  onRetry() {
    this.currentStep = 'cards';
    this.currentCardIndex = 0;
    this.score = 0;
    this.answeredCardIndexes = [];
  }

  get shouldDisplayCards() {
    return this.currentStep === 'cards';
  }

  get shouldDisplayScore() {
    return this.currentStep === 'score';
  }

  @action
  getCardZIndex(index) {
    return this.numberOfCards - index;
  }

  @action
  isCardAnswered(cardIndex) {
    return this.answeredCardIndexes.includes(cardIndex);
  }

  <template>
    <form onSubmit={{this.onSubmit}} class="element-qab" aria-describedby="instruction-{{this.element.id}}">
      <fieldset class="element-qab__container">
        <div class="element-qab__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </div>
        <div class="element-qab__cards">
          {{#each this.element.cards as |card index|}}
            <QabCard
              @card={{card}}
              @status={{this.currentCardStatus}}
              @index={{index}}
              @zIndex={{this.getCardZIndex index}}
              @isAnswered={{this.isCardAnswered index}}
            />
          {{/each}}
          <QabScoreCard @score={{this.score}} @total={{this.numberOfCards}} @onRetry={{this.onRetry}} />
        </div>
        <div class="element-qab__proposals">
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
  </template>
}
