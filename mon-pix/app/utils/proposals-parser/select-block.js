import ResponseBlock from './response-block';
import splitters from './splitters';

const {
  ESCAPE_SELECT,
  SELECT,
} = splitters;

export default class SelectBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });

    const parsedOptions = this._parseOptions();
    this.setOptions(parsedOptions);

    this.setType('select');
  }

  get options() {
    return this._options;
  }

  setOptions(value) {
    this._options = value;
  }

  _parseOptions() {
    const rawOptionArray = this.input.split(SELECT);
    return this._removeAllEscapedCharacters(rawOptionArray);
  }

  _removeAllEscapedCharacters(rawOptionArray) {
    return rawOptionArray.map((option) => option.split(ESCAPE_SELECT).join(SELECT));
  }

  get() {
    const responseBlock = super.get();
    responseBlock.options = this.options;
    return responseBlock;
  }
}
