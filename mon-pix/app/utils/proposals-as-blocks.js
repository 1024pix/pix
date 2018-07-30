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

export default function proposalsAsBlocks(proposals) {

  if (isEmpty(proposals)) {
    return [];
  }

  const result = [];

  const lines = proposals.split(/[\r|\n]+/);
  lines.forEach((line, index) => {
    const parts = line.split(/\s*(\${)|}\s*/);
    for (let j = 0; j < parts.length; j += 1) {
      const { lastIsOpening, block } = parseInput((lastIsOpening || false), parts[j]);
      if (!block) {
        continue;
      }
      if (block.input && stringHasPlaceholder(block.input)) {

        const inputParts = block.input.split('#');
        const variable = inputParts[0];
        const placeholder = inputParts[1];

        block.input = variable;
        block.placeholder = placeholder;
      }
      result.push(block);
    }
    if (index !== (lines.length - 1)) {
      result.push({ breakline: true });
    }
  });
  return result;
}
