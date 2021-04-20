const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');

const buildCleaCertificationResult = function({
  status = CleaCertificationResult.cleaStatuses.NOT_PASSED,
} = {}) {
  return new CleaCertificationResult({
    status,
  });
};

buildCleaCertificationResult.notPassed = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.NOT_PASSED,
  });
};

buildCleaCertificationResult.rejected = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.REJECTED,
  });
};

buildCleaCertificationResult.acquired = function() {
  return new CleaCertificationResult({
    status: CleaCertificationResult.cleaStatuses.ACQUIRED,
  });
};

module.exports = buildCleaCertificationResult;
