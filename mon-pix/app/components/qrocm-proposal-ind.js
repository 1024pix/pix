import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocmProposalInd extends Component {
  @service intl;

  ARIA_LABEL_DELIMITATOR = '#';

  get proposalBlocks() {
    const groupedBlocks = [];
    const blocks = proposalsAsBlocks(this.args.proposals).map((block, index) => {
      block.displayLegend = index === 0;
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
    blocks.forEach((block, index) => {
      if (block.text || index === 0) {
        groupedBlocks.push({ ...block, formElement: [] });
        console.log(block);
        if (block.type !== null) {
          groupedBlocks[groupedBlocks.length - 1].formElement.push(block);
        }
      } else {
        groupedBlocks[groupedBlocks.length - 1].formElement.push(block);
      }
    });
    return groupedBlocks;
  }

  _formatAriaLabel(rawAriaLabel) {
    return rawAriaLabel.split(this.ARIA_LABEL_DELIMITATOR)[0];
  }

  @action
  onInputChange(key, event) {
    this.args.answersValue[key] = event.target.value;
    this.args.answerChanged();
  }

  @action
  onChange(key, value) {
    this.args.answersValue[key] = value;
    this.args.onChangeSelect(this.args.answersValue);
  }

  @action
  buildGenericLabel(index, ariaLabel) {
    return ariaLabel || this.intl.t('pages.challenge.answer-input.numbered-label', { number: index + 1 });
  }
}
