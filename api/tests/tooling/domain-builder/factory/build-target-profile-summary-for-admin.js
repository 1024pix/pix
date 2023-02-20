import TargetProfileSummaryForAdmin from '../../../../lib/domain/models/TargetProfileSummaryForAdmin';

export default function buildTargetProfileSummaryForAdmin({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
  });
}
