const Solution = require('../../domain/models/Solution.js');
const _ = require('../../../lib/infrastructure/utils/lodash-utils.js');

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

function _extractTypeOfQroc(datasourceObject) {
  if (datasourceObject.type === 'QCU' || datasourceObject.type === 'QCM') {
    return {};
  }
  const qrocBlocksTypes = {};
  const qrocBlocks = _getAllBlocks(datasourceObject.proposals);

  qrocBlocks.forEach((qrocBlock) => {
    const blockText = qrocBlock[0];
    const qrocBlockKey = _getKeyOfBlock(blockText);
    const qrocBlockType = blockText.includes('options=') ? 'select' : 'input';
    qrocBlocksTypes[qrocBlockKey] = qrocBlockType;
  });

  return qrocBlocksTypes;
}

module.exports = {
  fromDatasourceObject(datasourceObject) {
    const scoring = _.ensureString(datasourceObject.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @
    const qrocBlocksTypes = _extractTypeOfQroc(datasourceObject);
    return new Solution({
      id: datasourceObject.id,
      isT1Enabled: statusToBoolean(datasourceObject.t1Status),
      isT2Enabled: statusToBoolean(datasourceObject.t2Status),
      isT3Enabled: statusToBoolean(datasourceObject.t3Status),
      type: datasourceObject.type,
      value: datasourceObject.solution,
      scoring,
      qrocBlocksTypes,
    });
  },
};
