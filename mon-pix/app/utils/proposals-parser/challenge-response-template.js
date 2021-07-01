const MINIMUM_SIZE_FOR_LABEL = 6;

export default class ChallengeResponseTemplate {

  constructor() {
    this._template = [];
    this._blocks = [];
    this._inputCount = 0;
  }

  add(block) {
    this._blocks.push(block);
  }

  constructFinalTemplate() {
    for (let index = 0; index < this._blocks.length; index++) {
      if (this._blocks[index].type) {
        this._template.push(this._blocks[index].get());
      }
    }
  }

  updateBlockDetails() {
    for (let current = 1; current < this._blocks.length; current++) {
      const previous = current - 1;
      if (this.isInputWithAutoAriaLabel(current) && this.isTextTypeWithConventionalTextLength(previous)) {
        this._blocks[current].setText(this._blocks[previous].text);
        this._blocks[current].removeAriaLabel();
        this._blocks[current].setAutoAriaLabel(false);
        this._blocks[previous].removeType();
      }
    }
  }

  isTextTypeWithConventionalTextLength(index) {
    return this._blocks[index].type === 'text' && this._blocks[index].text.length > MINIMUM_SIZE_FOR_LABEL;
  }

  isInputWithAutoAriaLabel(index) {
    return this._blocks[index].type === 'input' && this._blocks[index].autoAriaLabel;
  }

  incrementInputCount() {
    this._inputCount++;
  }

  get inputCount() {
    return this._inputCount;
  }

  get() {
    return this._template;
  }

  get blocks() {
    return this._blocks.map((block) => block.get());
  }
}
