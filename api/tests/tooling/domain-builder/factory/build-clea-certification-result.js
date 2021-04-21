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

buildCleaCertificationResult.notPassed = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.NOT_PASSED,
  });
};

module.exports = buildCleaCertificationResult;
