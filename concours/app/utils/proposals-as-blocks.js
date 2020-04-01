import { isEmpty } from 'lodash';

function parseInput(isInput, input) {
  let block;

  switch (input) {
    case '${':
      isInput = true;
      break;
    case undefined:
      isInput = false;
      break;
    case '':
      break;
    default:
      if (isInput) {
        block = new ResponseBlock({ input });
      }
      else {
        block = new ResponseBlock({ text: input });
      }
  }

  return { isInput, block };
}

function stringHasPlaceholder(input) {
  return 1 <= input.indexOf('#');
}

function isLastElement(currentIdx, elements) {
  return currentIdx === (elements.length - 1);
}

function getLastLine(lines) {
  return lines[lines.length - 1];
}

function isAriaLabelNeededForInputs(lines) {
  const lastLine = getLastLine(lines);
  const inputStartRegex = /\${/g;
  const lastLineInputs = lastLine.match(inputStartRegex, '');
  const hasMoreThanOneInputField = lastLineInputs && lastLineInputs.length > 1;
  const inputRegex = /\s*(\${.+?})|-| /g; //regex that remove spaces, -, ${} => should return only letters
  const lastLineWithoutInput = lastLine.replace(inputRegex, '');
  const blocks = lastLine.split(/\s*(\${)|}\s*/);
  const hasNoTextBeforeInput = !(blocks && blocks[0].replace(inputRegex, '').length > 0);

  if (hasMoreThanOneInputField || hasNoTextBeforeInput) {
    return true;
  }

  return lastLineWithoutInput.length === 0;
}

function buildLineFrom(blocks, ariaLabelNeeded, challengeResponseTemplate) {
  let previousBlockText = '';
  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx += 1) {
    const { isInput, block } = parseInput((isInput || false), blocks[blockIdx]);
    if (!block) {
      continue;
    }

    const isInputField = block.input != null;
    challengeResponseTemplate.incrementInputCount(isInputField);

    block.attachInputAndPlaceholderIfExist();
    const didAttachedLabel = block.attachLabel({
      isInputField,
      ariaLabelNeeded,
      previousBlockText,
      questionIdx: challengeResponseTemplate.inputCount });
    previousBlockText = didAttachedLabel ? '' : block.text;

    const canAddBlockToTemplate = ariaLabelNeeded || isInputField || isLastElement(blockIdx, blocks);
    challengeResponseTemplate.add({ canAddBlockToTemplate, block: block.get() });
  }
}

class ResponseBlock {

  constructor({ input, text, placeholder }) {
    this._input = input;
    this._text = text;
    this._placeholder = placeholder;
    this._ariaLabel = null;
  }

  attachInputAndPlaceholderIfExist() {
    if (this._input && stringHasPlaceholder(this._input)) {
      const inputParts = this._input.split('#');
      this._input = inputParts[0];
      this._placeholder = inputParts[1];
    }
  }

  attachLabel({ isInputField, ariaLabelNeeded, previousBlockText, questionIdx }) {
    if (!isInputField) {
      return false;
    }
    if (!ariaLabelNeeded
        && this._hasPreviousBlockText(previousBlockText)) {
      this._text = previousBlockText;
    }
    else {
      this._ariaLabel = 'Réponse ' + questionIdx;
    }
    return true;
  }

  _hasPreviousBlockText(previousBlockText) {
    return !(previousBlockText.trim().length === 1 && previousBlockText[0] === '-');
  }

  get input() {
    return this._input;
  }

  get text() {
    return this._text;
  }

  get() {
    return {
      input: this._input,
      text: this._text,
      placeholder: this._placeholder,
      ariaLabel: this._ariaLabel,
    };
  }
}

class ChallengeResponseTemplate {

  constructor() {
    this._template = [];
    this._inputCount = 0;
  }

  addLineBreakIfIsNotLastLine({ lineIdx, lines }) {
    if (!isLastElement(lineIdx, lines)) {
      this._template.push({ breakline: true });
    }
  }

  add({ canAddBlockToTemplate, block }) {
    if (canAddBlockToTemplate) {
      this._template.push(block);
    }
  }

  incrementInputCount(isInputField) {
    if (isInputField) {
      this._inputCount++;
    }
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
  const lines = proposals.split(/[\r|\n]+/).filter((line) => !isEmpty(line));
  const ariaLabelNeeded = isAriaLabelNeededForInputs(lines);

  lines.forEach((line, lineIdx) => {
    const blocks = line.split(/\s*(\${)|}\s*/);
    buildLineFrom(blocks, ariaLabelNeeded, challengeResponseTemplate);
    challengeResponseTemplate.addLineBreakIfIsNotLastLine({ lineIdx, lines });
  });
  return challengeResponseTemplate.get();
}
