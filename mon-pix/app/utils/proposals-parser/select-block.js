import ResponseBlock from './response-block';
import splitters from './splitters';

const {
  ARIA_LABEL,
  PLACEHOLDER_AND_ARIA_LABEL,
  PLACEHOLDER,
  SELECT,
} = splitters;

export default class SelectBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });
    if (this._hasOptions) {
      this.setOptions(this.input.split(SELECT));
    }
    this.setType('select');
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

  get _hasOptions() {
    return this._input.includes(SELECT);
  }
}
