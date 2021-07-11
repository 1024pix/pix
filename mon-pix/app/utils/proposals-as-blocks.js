import isEmpty from 'lodash/isEmpty';
import ChallengeResponseTemplate from './proposals-parser/challenge-response-template';
import InputBlock from './proposals-parser/input-block';
import SelectBlock from './proposals-parser/select-block';
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
  return challengeResponseTemplate.template;
}

function buildLineFrom(block, challengeResponseTemplate) {
  let blockToTemplate;

  if (_isInput(block)) {
    challengeResponseTemplate.incrementInputCount();

    if (_isSelect(block)) {
      blockToTemplate = new SelectBlock({ input: block, inputIndex: challengeResponseTemplate.inputCount });
    } else {
      blockToTemplate = new InputBlock({ input: block, inputIndex: challengeResponseTemplate.inputCount });
    }
  } else {
    blockToTemplate = new TextBlock({ text: block });
  }

  challengeResponseTemplate.addBlock(blockToTemplate);
}

function _isInput(block) {
  return block.includes('${');
}

function _isSelect(block) {
  return block.includes('||');
}
