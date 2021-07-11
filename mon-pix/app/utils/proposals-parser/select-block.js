import ResponseBlock from './response-block';

export default class SelectBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });
    if (this._hasOptions) {
      this.setOptions(this.input.split('||'));
    }
    this.setType('select');
    this.addPlaceHolderAndAriaLabelIfExist();
  }

  addPlaceHolderAndAriaLabelIfExist() {
    if (this.hasPlaceHolder) {
      this.setPlaceholder(this.input.split('#')[1].split('§')[0]);
    }
    if (this.hasAriaLabel) {
      this.setAriaLabel(this.input.split('§')[1]);
      this.setAutoAriaLabel(false);
    }
    this.setInput(this.input.split(/[#§]/)[0]);
  }

  get _hasOptions() {
    return this._input.includes('||');
  }
}
