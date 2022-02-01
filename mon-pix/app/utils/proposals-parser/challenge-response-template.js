const MINIMUM_SIZE_FOR_LABEL = 6;

export default class ChallengeResponseTemplate {
  constructor() {
    this._template = [];
    this._blocks = [];
    this._inputCount = 0;
  }

  constructFinalTemplate() {
    this._blocks.forEach((block) => {
      if (block.type) {
        this._template.push(block.get());
      }
    });
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

  addBlock(block) {
    this._blocks.push(block);
  }

  get inputCount() {
    return this._inputCount;
  }

  get template() {
    return this._template;
  }

  get blocks() {
    return this._blocks.map((block) => block.get());
  }
}
