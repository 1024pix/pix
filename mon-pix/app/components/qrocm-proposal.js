import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocmProposal extends Component {

  get proposalBlocks() {
    return proposalsAsBlocks(this.args.proposals)
      .map((block) => {
        block.showText = block.text && !block.ariaLabel && !block.input;
        block.randomName = generateRandomString(block.input);
        return block;
      });
  }

  @action
  onInputChange() {
    this.args.answerChanged();
  }
}
