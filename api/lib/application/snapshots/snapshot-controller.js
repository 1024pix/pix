const snapshotSerializer = require('../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const usecases = require('../../domain/usecases');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {
  
  async find(request) {
    const result = await usecases.findSnapshots({
      options: queryParamsUtils.extractParameters(request.query)
    });

    return snapshotSerializer.serialize(result.models, result.pagination);
  }
};
