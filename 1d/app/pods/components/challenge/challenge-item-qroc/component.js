import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from '../../../../utils/generate-random-string';
import proposalsAsBlocks from '../../../..//utils/proposals-as-blocks';
import { tracked } from '@glimmer/tracking';

export default class ChallengeItemQroc extends Component {
  @tracked qrocProposalAnswerValue = '';

  @action
  onChangeSelect(value) {
    this.qrocProposalAnswerValue = value;
    this.args.setAnswerValue(this.qrocProposalAnswerValue);
  }

  @action
  updateUserAnswerValue(event) {
    this.args.setAnswerValue(event.target.value);
  }

  get _blocks() {
    return proposalsAsBlocks(this.args.challenge.proposals).map((block) => {
      block.randomName = generateRandomString(block.input);
      block.ariaLabel = block.autoAriaLabel ? `Réponse {${block.ariaLabel}}` : block.ariaLabel;
      return block;
    });
  }
}
