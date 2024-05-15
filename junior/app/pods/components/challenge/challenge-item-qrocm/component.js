import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import proposalsAsBlocks from '../../../..//utils/proposals-as-blocks';
import generateRandomString from '../../../../utils/generate-random-string';

export default class ChallengeItemQrocm extends Component {
  @tracked answerValues;

  @action
  resetAnswerValues() {
    this.answerValues = this.#extractProposals();
  }

  #extractProposals() {
    const proposals = proposalsAsBlocks(this.args.challenge.proposals);
    const inputFieldsNames = {};

    proposals.forEach(({ input }) => {
      if (input) {
        inputFieldsNames[input] = '';
      }
    });

    return inputFieldsNames;
  }

  get proposalBlocks() {
    return proposalsAsBlocks(this.args.challenge.proposals).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      block.randomName = generateRandomString(block.input);
      block.ariaLabel = block.autoAriaLabel ? `Réponse {${block.ariaLabel}}` : block.ariaLabel;
      return block;
    });
  }

  @action
  onInputChange(key, event) {
    this.answerValues[key] = event.target.value;
    this.#synchronizeAnswers();
  }

  @action
  onSelectChange(key, value) {
    // Tracked property answersValue has to be reassigned to be considered as changed
    const newAnswersValue = this.answerValues;
    newAnswersValue[key] = value;
    this.answerValues = newAnswersValue;
    this.#synchronizeAnswers();
  }

  #synchronizeAnswers() {
    if (!this.#allFieldsAnswered) {
      this.args.setAnswerValue('');
      return;
    }
    if (this.#hasUniqueAnswer) {
      this.args.setAnswerValue(this.#uniqueAnswer);
    } else {
      this.args.setAnswerValue(JSON.stringify(this.answerValues));
    }
  }

  get #hasUniqueAnswer() {
    return Object.keys(this.answerValues).length === 1;
  }

  get #allFieldsAnswered() {
    return !Object.values(this.answerValues).includes('');
  }

  get #uniqueAnswer() {
    return Object.values(this.answerValues)[0];
  }
}
