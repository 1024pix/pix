export default class TextBlock {
  constructor({ text }) {
    const firstCharacter = text.substring(0, 1);
    const secondCharacter = text.substring(1, 2);
    const isListItem = firstCharacter === '-' || (Number.isInteger(Number(firstCharacter)) && secondCharacter === '.');
    if (isListItem) {
      text = '\n' + text;
    }
    this._text = text.replace(/\n/g, '<br/>');
    this._input = null;
    this._placeholder = null;
    this._ariaLabel = null;
    this._type = 'text';
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

  removeType() {
    this._type = null;
  }

  get() {
    return {
      text: this._text,
      type: this._type,
    };
  }
}
