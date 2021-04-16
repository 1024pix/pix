import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import { inject as service } from '@ember/service';

export default class QrocmProposal extends Component {
  @service intl;

  get proposalBlocks() {
    return proposalsAsBlocks(this.args.proposals)
      .map((block) => {
        block.showText = block.text && !block.ariaLabel && !block.input;
        block.randomName = generateRandomString(block.input);
        block.ariaLabel = block.autoAriaLabel ? this.intl.t('pages.challenge.answer-input.numbered-label', { number: block.ariaLabel }) : block.ariaLabel;
        return block;
      });
  }

  @action
  onInputChange() {
    this.args.answerChanged();
  }
}
