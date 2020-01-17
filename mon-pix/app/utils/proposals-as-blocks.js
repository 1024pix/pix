import { isEmpty } from 'lodash';

function parseInput(lastIsOpening, input) {
  let block = false;

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
        block = { input: input };
      }
      else {
        block = { text: input };
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

function attachInputAndPlaceholderIfExist(block) {
  if (block.input && stringHasPlaceholder(block.input)) {
    const inputParts = block.input.split('#');
    block.input = inputParts[0];
    block.placeholder = inputParts[1];
  }
}

export default function proposalsAsBlocks(proposals) {

  if (isEmpty(proposals)) {
    return [];
  }

  const challengeResponseTemplate = new ChallengeResponseTemplate();

  const lines = proposals.split(/[\r|\n]+/);
  lines.forEach((line, lineIdx) => {
    const parts = line.split(/\s*(\${)|}\s*/);
    for (let j = 0; j < parts.length; j += 1) {
      const { lastIsOpening, block } = parseInput((lastIsOpening || false), parts[j]);
      if (!block) {
        continue;
      }
      attachInputAndPlaceholderIfExist(block);
      challengeResponseTemplate.addAsNewLine(block);
    }
    challengeResponseTemplate.addLineBreakIfIsNotLastLine({ lineIdx, lines });
  });
  return challengeResponseTemplate.get();
}
