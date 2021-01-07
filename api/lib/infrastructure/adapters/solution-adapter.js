const Solution = require('../../domain/models/Solution');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

module.exports = {

  fromDatasourceObject(datasourceObject) {
    const scoring = _.ensureString(datasourceObject.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @

    return new Solution({
      id: datasourceObject.id,
      isT1Enabled: datasourceObject.t1Status !== 'Désactivé',
      isT2Enabled: datasourceObject.t2Status !== 'Désactivé',
      isT3Enabled: datasourceObject.t3Status !== 'Désactivé',
      type: datasourceObject.type,
      value: datasourceObject.solution,
      scoring,
    });
  },
};
