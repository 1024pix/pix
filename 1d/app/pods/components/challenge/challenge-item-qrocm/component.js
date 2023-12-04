import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from '../../../../utils/generate-random-string';
import proposalsAsBlocks from '../../../..//utils/proposals-as-blocks';
import { tracked } from '@glimmer/tracking';

export default class ChallengeItemQrocm extends Component {
  @tracked answersValue;

  constructor() {
    super(...arguments);
    this.answersValue = this._extractProposals();
  }

  _extractProposals() {
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
    this.answersValue[key] = event.target.value;
    this._synchronizeAnswers();
  }

  @action
  onSelectChange(key, value) {
    // Tracked property answersValue has to be reassigned to be considered as changed
    const newAnswersValue = this.answersValue;
    newAnswersValue[key] = value;
    this.answersValue = newAnswersValue;
    this._synchronizeAnswers();
  }

  _synchronizeAnswers() {
    if (this._allFieldsAnswered(this.answersValue)) {
      this.args.setAnswerValue(JSON.stringify(this.answersValue));
    } else {
      this.args.setAnswerValue('');
    }
  }

  _allFieldsAnswered(answers) {
    return !Object.values(answers).includes('');
  }
}
