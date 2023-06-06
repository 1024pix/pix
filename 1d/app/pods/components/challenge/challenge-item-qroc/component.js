import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from '../../../../utils/generate-random-string';
import proposalsAsBlocks from '../../../..//utils/proposals-as-blocks';

export default class ChallengeItemQroc extends Component {
  @action
  onChangeSelect(value) {
    this.args.setAnswerValue(value);
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
