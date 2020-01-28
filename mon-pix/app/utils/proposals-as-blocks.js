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
  const parts = lastLine.split(/\s*(\${)|}\s*/);
  const hasNoTextBeforeInput = !(parts && parts[0].replace(inputRegex, '').length > 0);

  if (hasMoreThanOneInputField || hasNoTextBeforeInput) {
    return true;
  }

  return lastLineWithoutInput.length === 0;
}

function buildLineFrom(parts, ariaLabelNeeded, challengeResponseTemplate) {
  let prevBlockText = '';
  for (let partIdx = 0; partIdx < parts.length; partIdx += 1) {
    const { isInput, block } = parseInput((isInput || false), parts[partIdx]);
    if (!block) {
      continue;
    }

    const isInputField = block.input != null;
    challengeResponseTemplate.incrementInputCount(isInputField);

    block.attachInputAndPlaceholderIfExist();
    const didAttachedLabel = block.attachLabel({
      isInputField,
      ariaLabelNeeded,
      prevBlockText,
      questionIdx: challengeResponseTemplate.inputCount });
    prevBlockText = didAttachedLabel ? '' : block.text;

    const canAddBlockToTemplate = ariaLabelNeeded || isInputField || isLastElement(partIdx, parts);
    challengeResponseTemplate.add({ canAddBlockToTemplate, block: block.get() });
  }
}

class ResponseBlock {

  constructor({ input, text, placeholder }) {
    this._input = input;
    this._text = text;
    this._placeholder = placeholder;
    this._ariaLabel = '';
  }

  attachInputAndPlaceholderIfExist() {
    if (this._input && stringHasPlaceholder(this._input)) {
      const inputParts = this._input.split('#');
      this._input = inputParts[0];
      this._placeholder = inputParts[1];
    }
  }

  attachLabel({ isInputField, ariaLabelNeeded, prevBlockText, questionIdx }) {
    if (isInputField
        && !ariaLabelNeeded
        && this._hasPrevBlockText(prevBlockText)) {
      this._text = prevBlockText;
      return true;
    }
    else if (isInputField) {
      this._ariaLabel = 'Réponse ' + questionIdx;
      return true;
    }
    return false;
  }

  _hasPrevBlockText(prevBlockText) {
    return !(prevBlockText.length === 1 && prevBlockText[0] === '-');
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
  const lines = proposals.split(/[\r|\n]+/).filter((line) => !!line);
  const ariaLabelNeeded = isAriaLabelNeededForInputs(lines);

  lines.forEach((line, lineIdx) => {
    const parts = line.split(/\s*(\${)|}\s*/);
    buildLineFrom(parts, ariaLabelNeeded, challengeResponseTemplate);
    challengeResponseTemplate.addLineBreakIfIsNotLastLine({ lineIdx, lines });
  });
  return challengeResponseTemplate.get();
}
