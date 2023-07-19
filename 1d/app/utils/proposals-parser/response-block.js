import splitters from './splitters';

const { ARIA_LABEL, PLACEHOLDER } = splitters;

export default class ResponseBlock {
  constructor({ inputIndex }) {
    this._input = null;
    this._placeholder = null;
    this._text = null;
    this._options = null;
    this._ariaLabel = inputIndex.toString();
    this._autoAriaLabel = true;
    this._type = undefined;
    this._defaultValue = null;
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

  get defaultValue() {
    return this._defaultValue;
  }

  setDefaultValue(value) {
    this._defaultValue = value;
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
      defaultValue: this._defaultValue,
    };
  }
}
