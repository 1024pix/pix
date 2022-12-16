import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import { inject as service } from '@ember/service';

export default class QrocmProposal extends Component {
  @service intl;

  ARIA_LABEL_DELIMITATOR = '#';

  get proposalBlocks() {
    return proposalsAsBlocks(this.args.proposals).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      block.randomName = generateRandomString(block.input);
      if (block.ariaLabel) {
        if (block.autoAriaLabel) {
          block.ariaLabel = this.intl.t('pages.challenge.answer-input.numbered-label', { number: block.ariaLabel });
        }
        block.ariaLabel = this._formatAriaLabel(block.ariaLabel);
      }
      return block;
    });
  }

  _formatAriaLabel(rawAriaLabel) {
    return rawAriaLabel.split(this.ARIA_LABEL_DELIMITATOR)[0];
  }

  @action
  onInputChange() {
    this.args.answerChanged();
  }

  @action
  setAnswerValue(event) {
    const key = event.target.id;
    this.args.answersValue[key] = event.target.value;
  }
}
