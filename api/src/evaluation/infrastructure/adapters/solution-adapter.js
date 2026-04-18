import { Solution } from '../../domain/models/Solution.js';

function statusToBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  return value !== 'Désactivé';
}

function _getAllBlocks(proposals) {
  return proposals ? Array.from(proposals.matchAll(/\$\{(.*?)\}/g)) : [];
}

function _getKeyOfBlock(block) {
  return block.replace('${', '').match(/^(.+?)(#|§|}| options)+/i)[1];
}

function _extractTypeOfQroc(challenge) {
  if (challenge.type === 'QCU' || challenge.type === 'QCM') {
    return {};
  }
  const qrocBlocksTypes = {};
  const qrocBlocks = _getAllBlocks(challenge.proposals);

  qrocBlocks.forEach((qrocBlock) => {
    const blockText = qrocBlock[0];
    const qrocBlockKey = _getKeyOfBlock(blockText);
    qrocBlocksTypes[qrocBlockKey] = blockText.includes('options=') ? 'select' : 'input';
  });

  return qrocBlocksTypes;
}

export function fromDatasourceObject(datasourceObject) {
  const qrocBlocksTypes = _extractTypeOfQroc(datasourceObject);
  return new Solution({
    id: datasourceObject.id,
    isT1Enabled: statusToBoolean(datasourceObject.t1Status),
    isT2Enabled: statusToBoolean(datasourceObject.t2Status),
    isT3Enabled: statusToBoolean(datasourceObject.t3Status),
    type: datasourceObject.type,
    value: datasourceObject.solution,
    qrocBlocksTypes,
  });
}

export function fromChallenge(challenge) {
  const qrocBlocksTypes = _extractTypeOfQroc(challenge);
  return new Solution({
    id: challenge.id,
    isT1Enabled: statusToBoolean(challenge.t1Status),
    isT2Enabled: statusToBoolean(challenge.t2Status),
    isT3Enabled: statusToBoolean(challenge.t3Status),
    type: challenge.type,
    value: challenge.solution,
    qrocBlocksTypes,
  });
}
