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
  }

  _addOptions() {
    const parsedOptions = this._parseOptions();
    const formattedOptions = this._formatSelectOptions(parsedOptions);
    this.setOptions(formattedOptions);
    this.setType('select');
  }

  _addPlaceHolderAndAriaLabelIfExist() {

    this._addOptions();

    if (this.hasPlaceHolder) {
      this.setPlaceholder(this.input.split(PLACEHOLDER)[1].split(ARIA_LABEL)[0].trim());
    }
    if (this.hasAriaLabel) {
      this.setAriaLabel(this.input.split(ARIA_LABEL)[1].trim());
      this.setAutoAriaLabel(false);
    }
    this.setInput(this.input.split(PLACEHOLDER_AND_ARIA_LABEL)[0].trim());
  }

  get options() {
    return this._options;
  }

  setOptions(value) {
    this._options = value;
  }

  _parseOptions() {
    const rawOptionArray = this.input.split(SELECT);
    const rawOptions = rawOptionArray.length > 1 ? rawOptionArray[1] : '[]';

    this.setInput(this.input.replace(rawOptions, '').replace(SELECT, ''));

    const rawOptionsBlock = rawOptions.substring(0, rawOptions.lastIndexOf(']') + 1);
    return JSON.parse(rawOptionsBlock);
  }

  _formatSelectOptions(options) {
    return options.map((option) => {
      return {
        value: option,
        label: option,
      };
    });
  }

  get() {
    const responseBlock = super.get();
    responseBlock.options = this.options;
    return responseBlock;
  }
}
