const PixPlusDroitMaitreCertificationResult = require('./../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const PixPlusDroitExpertCertificationResult = require('./../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

const buildPixPlusDroitCertificationResult = function({
  status = PixPlusDroitMaitreCertificationResult.statuses.ACQUIRED,
} = {}) {
  return new PixPlusDroitMaitreCertificationResult({
    status,
  });
};

buildPixPlusDroitCertificationResult.maitre = function({
  status = PixPlusDroitMaitreCertificationResult.statuses.ACQUIRED,
}) {
  return new PixPlusDroitMaitreCertificationResult({
    status,
  });
};

buildPixPlusDroitCertificationResult.expert = function({
  status = PixPlusDroitExpertCertificationResult.statuses.ACQUIRED,
}) {
  return new PixPlusDroitExpertCertificationResult({
    status,
  });
};

buildPixPlusDroitCertificationResult.maitre.acquired = function() {
  return new PixPlusDroitMaitreCertificationResult({
    status: PixPlusDroitMaitreCertificationResult.statuses.ACQUIRED,
  });
};

buildPixPlusDroitCertificationResult.maitre.rejected = function() {
  return new PixPlusDroitMaitreCertificationResult({
    status: PixPlusDroitMaitreCertificationResult.statuses.REJECTED,
  });
};

buildPixPlusDroitCertificationResult.maitre.notTaken = function() {
  return new PixPlusDroitMaitreCertificationResult({
    status: PixPlusDroitMaitreCertificationResult.statuses.NOT_TAKEN,
  });
};

buildPixPlusDroitCertificationResult.expert.acquired = function() {
  return new PixPlusDroitExpertCertificationResult({
    status: PixPlusDroitExpertCertificationResult.statuses.ACQUIRED,
  });
};

buildPixPlusDroitCertificationResult.expert.rejected = function() {
  return new PixPlusDroitExpertCertificationResult({
    status: PixPlusDroitExpertCertificationResult.statuses.REJECTED,
  });
};

buildPixPlusDroitCertificationResult.expert.notTaken = function() {
  return new PixPlusDroitExpertCertificationResult({
    status: PixPlusDroitExpertCertificationResult.statuses.NOT_TAKEN,
  });
};

module.exports = buildPixPlusDroitCertificationResult;
