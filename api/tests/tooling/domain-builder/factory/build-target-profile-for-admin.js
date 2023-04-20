const buildArea = require('./build-area');
const buildCompetence = require('./build-competence');
const buildThematic = require('./build-thematic');
const buildTube = require('./build-tube');
const buildStageCollection = require('./target-profile-management/build-stage-collection');
const TargetProfileForAdmin = require('../../../../lib/domain/models/TargetProfileForAdmin');

module.exports = function buildTargetProfileForAdmin({
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
  stageCollection = buildStageCollection({ id: 123, maxLevel: 2, stages: [] }),
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
    stageCollection,
    areas,
    competences,
    thematics,
    tubes: tubesWithLevelThematicMobileAndTablet,
  });
};
