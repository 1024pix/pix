import isEmpty from 'lodash/isEmpty';

const MINIMUM_SIZE_FOR_LABEL = 6;
function stringHasPlaceholder(input) {
  return input.includes('#');
}

function stringHasAriaLabel(input) {
  return input.includes('§');
}

function _isInput(block) {
  return block.includes('${');
}

function buildLineFrom(textBlock, challengeResponseTemplate) {
  const isInput = _isInput(textBlock);
  const block = textBlock;

  if (isInput) {
    challengeResponseTemplate.incrementInputCount();
    const blockToTemplate = new InputBlock({ input: block, inputIndex: challengeResponseTemplate.inputCount });
    blockToTemplate.addPlaceHolderAndAriaLabelIfExist();
    challengeResponseTemplate.add(blockToTemplate);

  } else {
    const blockToTemplate = new TextBlock({ text: block });
    challengeResponseTemplate.add(blockToTemplate);
  }
}

class TextBlock {

  constructor({ text }) {

    const firstCharacter = text.substring(0, 1);
    const secondCharacter = text.substring(1, 2);
    const isListItem = firstCharacter === '-'
      || Number.isInteger(Number(firstCharacter)) && secondCharacter === '.';
    if (isListItem) {
      text = '\n' + text;
    }
    this._text = text ? text.replace(/\n/g, '<br/>') : text;
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

class InputBlock {

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
    if (stringHasPlaceholder(this._input)) {
      this._placeholder = this._input.split('#')[1].split('§')[0];
    }
    if (stringHasAriaLabel(this._input)) {
      this._ariaLabel = this._input.split('§')[1];
      this._autoAriaLabel = false;
    }
    this._input = this._input.split(/#|§/)[0];
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

class ChallengeResponseTemplate {

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

export default function proposalsAsBlocks(proposals) {

  if (isEmpty(proposals)) {
    return [];
  }

  const challengeResponseTemplate = new ChallengeResponseTemplate();
  const blocks = proposals.split(/(\$\{[^}]+\})/).filter((line) => !isEmpty(line));
  blocks.forEach((block) => {
    buildLineFrom(block, challengeResponseTemplate);
  });

  challengeResponseTemplate.updateBlockDetails();
  challengeResponseTemplate.constructFinalTemplate();
  return challengeResponseTemplate.get();
}
