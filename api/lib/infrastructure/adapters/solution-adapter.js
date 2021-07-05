const Solution = require('../../domain/models/Solution');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

function statusToBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  return value !== 'Désactivé';
}

module.exports = {

  fromDatasourceObject(datasourceObject) {
    const scoring = _.ensureString(datasourceObject.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @

    return new Solution({
      id: datasourceObject.id,
      isT1Enabled: statusToBoolean(datasourceObject.t1Status),
      isT2Enabled: statusToBoolean(datasourceObject.t2Status),
      isT3Enabled: statusToBoolean(datasourceObject.t3Status),
      type: datasourceObject.type,
      value: datasourceObject.solution,
      scoring,
    });
  },
};
