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

function attachInputAndPlaceholderIfExist(block) {
  if (block.input && stringHasPlaceholder(block.input)) {
    const inputParts = block.input.split('#');
    block.input = inputParts[0];
    block.placeholder = inputParts[1];
  }
}

function getLastLine(lines) {
  return lines[lines.length - 1];
}

function shouldAddLabelToInput(lines) {
  //if "Le protocole ${https} assure que ${https}" => ${}${}
  //if "Réponses :↵${rep1}↵${rep2}" => ↵${}↵${}
  //if "- comparaison entre requête et pages web ${comparaison}↵- comparaison entre" => -${}↵-${}
  const lastLine = getLastLine(lines);
  const parts = line.split(/\s*(\${)|}\s*/);
  // const foo = (?s)\\${\\^.+?\\};

  //sur chaque ligne, enlever l'input
  //si lettre => add label
  console.log(lastLine.replace(/\s*\${.+?}/, ''));
}

class ChallengeResponseTemplate {

  _template;

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
