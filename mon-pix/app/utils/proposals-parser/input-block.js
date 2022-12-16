import ResponseBlock from './response-block';
import splitters from './splitters';

const { ARIA_LABEL, PLACEHOLDER_AND_ARIA_LABEL, PLACEHOLDER, RESPONSE_BLOCK_BEGIN, RESPONSE_BLOCK_END } = splitters;

export default class InputBlock extends ResponseBlock {
  constructor({ input, inputIndex }) {
    super({ inputIndex });
    this._input = input.replace(RESPONSE_BLOCK_BEGIN, '').replace(RESPONSE_BLOCK_END, '');
    this._addPlaceHolderAndAriaLabelIfExist();
    this.setType('input');
  }

  _addPlaceHolderAndAriaLabelIfExist() {
    if (this.hasPlaceHolder) {
      this.setPlaceholder(this.input.split(PLACEHOLDER)[1].split(ARIA_LABEL)[0]);
    }
    if (this.hasAriaLabel) {
      this.setAriaLabel(this.input.split(ARIA_LABEL)[1]);
      this.setAutoAriaLabel(false);
    }
    this.setInput(this.input.split(PLACEHOLDER_AND_ARIA_LABEL)[0]);
  }
}
