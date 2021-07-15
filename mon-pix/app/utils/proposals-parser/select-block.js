import ResponseBlock from './response-block';
import splitters from './splitters';

const {
  ARIA_LABEL,
  ESCAPE_SELECT,
  PLACEHOLDER_AND_ARIA_LABEL,
  PLACEHOLDER,
  SELECT,
} = splitters;

export default class SelectBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });

    const parsedOptions = this._parseOptions();
    this.setOptions(parsedOptions);

    this.setType('select');
    this._addPlaceHolderAndAriaLabelIfExist();
  }

  _parseOptions() {
    const rawOptionArray = this.input.split(SELECT);
    return this._removeAllEscapedCharacters(rawOptionArray);
  }

  _removeAllEscapedCharacters(rawOptionArray) {
    return rawOptionArray.map((option) => option.split(ESCAPE_SELECT).join(SELECT));
  }

  _addPlaceHolderAndAriaLabelIfExist() {
    if (this.hasPlaceHolder) {
      this.setPlaceholder(this.input.split(PLACEHOLDER)[1].split(ARIA_LABEL)[0]);
    }
    if (this.hasAriaLabel) {
      this.setAriaLabel(this.input.split(ARIA_LABEL)[1]);
      this.setAutoAriaLabel(false);
    }
    this.setInput(this.input.split(PLACEHOLDER_AND_ARIA_LABEL)[0]);
  }
}
