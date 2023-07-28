import { TargetProfileHistoryForAdmin } from '../../../../lib/domain/models/TargetProfileHistoryForAdmin.js';

const buildTargetProfileHistoryForAdmin = function ({
  id = 999,
  name = 'Target',
  attachedAt,
  detachedAt = null,
  badges = [],
}) {
  return new TargetProfileHistoryForAdmin({ id, name, attachedAt, detachedAt, badges });
};

export { buildTargetProfileHistoryForAdmin };
