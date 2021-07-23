import splitters from './splitters';

const {
  ARIA_LABEL,
  PLACEHOLDER_AND_ARIA_LABEL,
  PLACEHOLDER,
  RESPONSE_BLOCK_BEGIN,
  RESPONSE_BLOCK_END,
} = splitters;

export default class ResponseBlock {

  constructor({ input, inputIndex }) {

    const end = input.lastIndexOf(RESPONSE_BLOCK_END);
    this._input = input.substring(0, end).replace(RESPONSE_BLOCK_BEGIN, '');
    this._placeholder = null;
    this._text = null;
    this._options = null;
    this._ariaLabel = inputIndex.toString();
    this._autoAriaLabel = true;
    this._type = undefined;

    this._addPlaceHolderAndAriaLabelIfExist();
  }

  _addPlaceHolderAndAriaLabelIfExist() {
    if (this.hasPlaceHolder) {
      this.setPlaceholder(this.input.split(PLACEHOLDER)[1].split(ARIA_LABEL)[0]);
    }
    if (this.hasAriaLabel) {
      this.setAriaLabel(this.input.split(ARIA_LABEL)[1]);
      this.setAutoAriaLabel(false);
    }
    this.setInput(this.input.split(PLACEHOLDER_AND_ARIA_LABEL)[0].trim());
  }

  get hasPlaceHolder() {
    return this._input.includes(PLACEHOLDER);
  }

  get hasAriaLabel() {
    return this._input.includes(ARIA_LABEL);
  }

  get input() {
    return this._input;
  }

  setInput(value) {
    this._input = value;
  }

  get text() {
    return this._text;
  }

  setText(value) {
    this._text = value;
  }

  get type() {
    return this._type;
  }

  setType(value) {
    this._type = value;
  }

  get ariaLabel() {
    return this._ariaLabel;
  }

  setAriaLabel(value) {
    this._ariaLabel = value;
  }

  get autoAriaLabel() {
    return this._autoAriaLabel;
  }

  setAutoAriaLabel(value) {
    this._autoAriaLabel = value;
  }

  get placeholder() {
    return this._placeholder;
  }

  setPlaceholder(value) {
    this._placeholder = value;
  }

  removeAriaLabel() {
    this._ariaLabel = null;
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
