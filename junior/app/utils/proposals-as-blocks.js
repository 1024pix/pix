import ChallengeResponseTemplate from './proposals-parser/challenge-response-template';
import InputBlock from './proposals-parser/input-block';
import SelectBlock from './proposals-parser/select-block';
import splitters from './proposals-parser/splitters';
import TextBlock from './proposals-parser/text-block';

const { BLOCK, RESPONSE_BLOCK_BEGIN, SELECT } = splitters;

export default function proposalsAsBlocks(proposals) {
  if (proposals.length === 0) {
    return [];
  }

  const challengeResponseTemplate = new ChallengeResponseTemplate();
  const blocks = proposals.split(BLOCK).filter((line) => line.length !== 0);

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
  return block.includes(RESPONSE_BLOCK_BEGIN);
}

function _isSelect(block) {
  return block.includes(SELECT);
}
