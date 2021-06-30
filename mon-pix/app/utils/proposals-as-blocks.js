import isEmpty from 'lodash/isEmpty';
import ChallengeResponseTemplate from './proposals-parser/challenge-response-template';
import InputBlock from './proposals-parser/input-block';
import TextBlock from './proposals-parser/text-block';

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

function _isInput(block) {
  return block.includes('${');
}
