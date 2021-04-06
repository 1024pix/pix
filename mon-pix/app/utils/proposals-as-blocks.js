import isEmpty from 'lodash/isEmpty';

const MINIMUM_SIZE_FOR_LABEL = 5;
function stringHasPlaceholder(input) {
  return 1 <= input.indexOf('#');
}

function stringHasAriaLabel(input) {
  return 1 <= input.indexOf('§');
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
    blockToTemplate.attachInputAndPlaceholderIfExist();
    challengeResponseTemplate.add(blockToTemplate);

  } else {
    const blockToTemplate = new TextBlock({ text: block });
    challengeResponseTemplate.add(blockToTemplate);
  }
}

class TextBlock {

  constructor({ text }) {
    if (text) {
      if (text.substring(0, 1) === '\n') {
        text = '<br/>' + text;
      }
      if (text.substring(text.length - 1, text.length) === '\n') {
        text = text + '<br/>';
      }
      this._text = text;
    } else {
      this._text = text ? text.replace('\n', '<br/>') : text;
    }
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
      input: this._input,
      text: this._text,
      placeholder: this._placeholder,
      ariaLabel: this._ariaLabel,
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
    this._ariaLabel = 'Réponse ' + inputIndex;
    this._autoAriaLabel = true;
    this._type = 'input';
  }

  attachInputAndPlaceholderIfExist() {
    if (stringHasPlaceholder(this._input)) {
      const inputParts = this._input.split('#');
      if (stringHasAriaLabel(this._input)) {
        const informations = inputParts[1].split('§');
        this._placeholder = informations[0];
        this._ariaLabel = informations[1];
        this._autoAriaLabel = false;
      } else {
        this._placeholder = inputParts[1];
      }
      this._input = inputParts[0];
    }
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

  get() {
    return {
      input: this._input,
      text: this._text,
      placeholder: this._placeholder,
      ariaLabel: this._ariaLabel,
      type: this._type,
    };
  }
}

class ChallengeResponseTemplate {

  constructor() {
    this._template = [];
    this._detailledTemplate = [];
    this._inputCount = 0;
  }

  add(block) {
    this._detailledTemplate.push(block);
  }

  constructFinalTemplate() {
    for (let index = 0; index < this._detailledTemplate.length; index++) {
      if (this._detailledTemplate[index].type) {
        this._template.push(this._detailledTemplate[index].get());
      }
    }
  }

  mixteTextAndInputBlock() {
    for (let index = 1; index < this._detailledTemplate.length; index++) {
      if (this._detailledTemplate[index].type == 'input'
        && this._detailledTemplate[index].autoAriaLabel
        && this._detailledTemplate[index - 1].type == 'text'
        && this._detailledTemplate[index - 1].text.length > MINIMUM_SIZE_FOR_LABEL) {
        this._detailledTemplate[index].setText(this._detailledTemplate[index - 1].text);
        this._detailledTemplate[index].removeAriaLabel();
        this._detailledTemplate[index - 1].removeType();
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

  challengeResponseTemplate.mixteTextAndInputBlock();
  challengeResponseTemplate.constructFinalTemplate();
  return challengeResponseTemplate.get();
}
