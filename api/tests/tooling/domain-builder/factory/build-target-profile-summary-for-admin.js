import { TargetProfileSummaryForAdmin } from '../../../../lib/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
  });
};

export { buildTargetProfileSummaryForAdmin };
