export default class InputBlock {

  constructor({ input, inputIndex }) {
    const inputText = input.replace('${', '').replace('}', '');
    this._input = inputText;
    this._placeholder = null;
    this._text = null;
    this._ariaLabel = inputIndex.toString();
    this._autoAriaLabel = true;
    this._type = 'input';
  }

  addPlaceHolderAndAriaLabelIfExist() {
    if (this._stringHasPlaceholder(this._input)) {
      this._placeholder = this._input.split('#')[1].split('§')[0];
    }
    if (this._stringHasAriaLabel(this._input)) {
      this._ariaLabel = this._input.split('§')[1];
      this._autoAriaLabel = false;
    }
    this._input = this._input.split(/#|§/)[0];
  }

  _stringHasPlaceholder(input) {
    return input.includes('#');
  }

  _stringHasAriaLabel(input) {
    return input.includes('§');
  }

  get input() {
    return this._input;
  }

  get text() {
    return this._text;
  }

  get type() {
    return this._type;
  }

  get autoAriaLabel() {
    return this._autoAriaLabel;
  }

  removeAriaLabel() {
    this._ariaLabel = null;
  }

  setText(text) {
    this._text = text;
  }

  setAutoAriaLabel(boolean) {
    this._autoAriaLabel = boolean;
  }

  get() {
    return {
      input: this._input,
      text: this._text,
      placeholder: this._placeholder,
      ariaLabel: this._ariaLabel,
      type: this._type,
      autoAriaLabel: this._autoAriaLabel,
    };
  }
}
