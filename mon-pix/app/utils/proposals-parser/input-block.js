import ResponseBlock from './response-block';

export default class InputBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });
    this.setType('input');
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
}
