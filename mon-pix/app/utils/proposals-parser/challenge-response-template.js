const MINIMUM_SIZE_FOR_LABEL = 6;

export default class ChallengeResponseTemplate {

  constructor() {
    this._template = [];
    this._detailedTemplate = [];
    this._inputCount = 0;
  }

  add(block) {
    this._detailedTemplate.push(block);
  }

  constructFinalTemplate() {
    for (let index = 0; index < this._detailedTemplate.length; index++) {
      if (this._detailedTemplate[index].type) {
        this._template.push(this._detailedTemplate[index].get());
      }
    }
  }

  updateBlockDetails() {
    for (let index = 1; index < this._detailedTemplate.length; index++) {
      if (this._detailedTemplate[index].type === 'input'
        && this._detailedTemplate[index].autoAriaLabel
        && this._detailedTemplate[index - 1].type === 'text'
        && this._detailedTemplate[index - 1].text.length > MINIMUM_SIZE_FOR_LABEL) {
        this._detailedTemplate[index].setText(this._detailedTemplate[index - 1].text);
        this._detailedTemplate[index].removeAriaLabel();
        this._detailedTemplate[index].setAutoAriaLabel(false);
        this._detailedTemplate[index - 1].removeType();
      }
    }
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
}
