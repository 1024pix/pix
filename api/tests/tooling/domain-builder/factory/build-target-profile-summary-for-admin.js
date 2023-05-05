const TargetProfileSummaryForAdmin = require('../../../../lib/domain/models/TargetProfileSummaryForAdmin');

module.exports = function buildTargetProfileSummaryForAdmin({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
  createdAt,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
    createdAt,
  });
};
