import { TargetProfileSummaryForAdmin } from '../../../../lib/shared/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
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

export { buildTargetProfileSummaryForAdmin };
