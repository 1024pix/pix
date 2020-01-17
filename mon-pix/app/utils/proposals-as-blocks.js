import { isEmpty } from 'lodash';

function parseInput(lastIsOpening, input) {
  let block;

  switch (input) {
    case '${':
      lastIsOpening = true;
      break;
    case undefined:
      lastIsOpening = false;
      break;
    case '':
      break;
    default:
      if (lastIsOpening) {
        block = new ResponseBlock({ input });
      }
      else {
        block = new ResponseBlock({ text: input });
      }
  }

  return { lastIsOpening, block };
}

function stringHasPlaceholder(input) {
  return 1 <= input.indexOf('#');
}

function isLastLine(currentIdx, lines) {
  return currentIdx === (lines.length - 1);
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

  if (hasMoreThanOneInputField) {
    return true;
  }

  return lastLineWithoutInput.length > 0 ? false : true;
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
    if (isInputField && !ariaLabelNeeded) {
      if (prevBlockText) {
        this._text = prevBlockText;
        return true;
      }
    }
    else if (isInputField) {
      this._ariaLabel = 'Réponse ' + questionIdx;
      return true;
    }
    return false;
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
  }

  addLineBreakIfIsNotLastLine({ lineIdx, lines }) {
    if (!isLastLine(lineIdx, lines)) {
      this._template.push({ breakline: true });
    }
  }

  addAsNewLine(block) {
    this._template.push(block);
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
  let inputCount = 0;
  lines.forEach((line, lineIdx) => {
    const parts = line.split(/\s*(\${)|}\s*/);
    let prevBlockText = '';
    for (let j = 0; j < parts.length; j += 1) {
      const { lastIsOpening, block } = parseInput((lastIsOpening || false), parts[j]);
      if (!block) {
        continue;
      }

      const isInputField = block.input != null;
      if (isInputField) {
        inputCount++;
      }

      block.attachInputAndPlaceholderIfExist();
      const didAttachedLabel = block.attachLabel({ isInputField, ariaLabelNeeded, prevBlockText, questionIdx: inputCount });
      prevBlockText = didAttachedLabel ? '' : block.text;

      if (ariaLabelNeeded || block.input) {
        challengeResponseTemplate.addAsNewLine(block.get());
      }
      else if (j === parts.length - 1) {
        challengeResponseTemplate.addAsNewLine(block.get());
      }
    }
    challengeResponseTemplate.addLineBreakIfIsNotLastLine({ lineIdx, lines });
  });
  return challengeResponseTemplate.get();
}
