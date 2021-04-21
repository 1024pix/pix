const CleaCertificationResult = require('./../../../../lib/domain/models/CleaCertificationResult');

const buildCleaCertificationResult = function({
  status = CleaCertificationResult.cleaStatuses.ACQUIRED,
} = {}) {
  return new CleaCertificationResult({
    status,
  });
};

buildCleaCertificationResult.acquired = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.ACQUIRED,
  });
};

buildCleaCertificationResult.rejected = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.REJECTED,
  });
};

buildCleaCertificationResult.notTaken = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.NOT_TAKEN,
  });
};

module.exports = buildCleaCertificationResult;
