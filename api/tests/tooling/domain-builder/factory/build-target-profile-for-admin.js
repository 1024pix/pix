import buildArea from './build-area';
import buildCompetence from './build-competence';
import buildThematic from './build-thematic';
import buildTube from './build-tube';
import TargetProfileForAdmin from '../../../../lib/domain/models/TargetProfileForAdminNewFormat';

export default function buildTargetProfileForAdmin({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
  isPublic = true,
  createdAt = new Date('2002-01-01'),
  ownerOrganizationId = null,
  description = 'description',
  comment = 'commentaire',
  imageUrl = 'image/url',
  category = 'some_category',
  isSimplifiedAccess = true,
  badges = [],
  areas = [buildArea({ id: 'recArea' })],
  competences = [buildCompetence({ id: 'recCompetence', area: buildArea({ id: 'recArea' }) })],
  thematics = [buildThematic({ id: 'recThematic', competenceId: 'recCompetence' })],
  tubesWithLevelThematicMobileAndTablet = [
    { ...buildTube(), thematicId: 'recThematic', level: 2, mobile: true, tablet: false },
  ],
} = {}) {
  return new TargetProfileForAdmin({
    id,
    name,
    outdated,
    isPublic,
    createdAt,
    ownerOrganizationId,
    description,
    comment,
    imageUrl,
    category,
    isSimplifiedAccess,
    badges,
    areas,
    competences,
    thematics,
    tubes: tubesWithLevelThematicMobileAndTablet,
  });
}
