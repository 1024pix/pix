import ResponseBlock from './response-block';
import splitters from './splitters';

const {
  ARIA_LABEL,
  PLACEHOLDER_AND_ARIA_LABEL,
  PLACEHOLDER,
} = splitters;

export default class InputBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });
    this.setType('input');
    this.addPlaceHolderAndAriaLabelIfExist();
  }

  addPlaceHolderAndAriaLabelIfExist() {
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
