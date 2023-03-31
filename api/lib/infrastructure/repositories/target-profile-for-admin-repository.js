const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../domain/errors.js');
const { FRENCH_FRANCE } = require('../../domain/constants.js').LOCALE;
const areaRepository = require('./area-repository.js');
const competenceRepository = require('./competence-repository.js');
const thematicRepository = require('./thematic-repository.js');
const tubeRepository = require('./tube-repository.js');
const TargetProfileForAdmin = require('../../domain/models/TargetProfileForAdmin.js');
const { BadgeDetails, BadgeCriterion, CappedTube, SCOPES } = require('../../domain/models/BadgeDetails.js');

module.exports = {
  async get({ id, locale = FRENCH_FRANCE }) {
    const targetProfileDTO = await knex('target-profiles')
      .select(
        'target-profiles.id',
        'target-profiles.name',
        'target-profiles.outdated',
        'target-profiles.isPublic',
        'target-profiles.imageUrl',
        'target-profiles.createdAt',
        'target-profiles.description',
        'target-profiles.comment',
        'target-profiles.ownerOrganizationId',
        'target-profiles.category',
        'target-profiles.isSimplifiedAccess'
      )
      .where('id', id)
      .first();

    if (targetProfileDTO == null) {
      throw new NotFoundError("Le profil cible n'existe pas");
    }

    const tubesData = await knex('target-profile_tubes')
      .select('tubeId', 'level')
      .where('targetProfileId', targetProfileDTO.id);
    return _toDomain(targetProfileDTO, tubesData, locale);
  },
};

async function _toDomain(targetProfileDTO, tubesData, locale) {
  const { areas, competences, thematics, tubes } = await _getLearningContent(targetProfileDTO.id, tubesData, locale);
  const badges = await _findBadges(targetProfileDTO.id);

  return new TargetProfileForAdmin({
    ...targetProfileDTO,
    badges,
    areas,
    competences,
    thematics,
    tubes,
  });
}

async function _getLearningContent(targetProfileId, tubesData, locale) {
  const tubeIds = tubesData.map((data) => data.tubeId);
  const tubes = await tubeRepository.findByRecordIds(tubeIds, locale);
  const notFoundTubeIds = tubeIds.filter((id) => !tubes.map((tube) => tube.id).includes(id));
  if (notFoundTubeIds.length > 0) {
    throw new NotFoundError(
      `Les sujets [${notFoundTubeIds.join(
        ', '
      )}] du profil cible ${targetProfileId} n'existent pas dans le référentiel.`
    );
  }

  const thematicIds = _.keys(_.groupBy(tubes, 'thematicId'));
  const thematics = await thematicRepository.findByRecordIds(thematicIds, locale);

  const competenceIds = _.keys(_.groupBy(thematics, 'competenceId'));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const areaIds = _.keys(_.groupBy(competences, 'areaId'));
  const areas = await areaRepository.findByRecordIds({ areaIds, locale });

  for (const tube of tubes) {
    const tubeData = tubesData.find((data) => tube.id === data.tubeId);
    tube.level = tubeData.level;
  }

  return {
    areas,
    competences,
    thematics,
    tubes,
  };
}

async function _findBadges(targetProfileId) {
  const badgeDTOs = await knex('badges').select('*').where({ targetProfileId }).orderBy('id');
  const badges = [];
  for (const badgeDTO of badgeDTOs) {
    const badgeCriteriaDTO = await knex('badge-criteria').select('*').where({ badgeId: badgeDTO.id }).orderBy('id');
    const criteria = [];
    for (const badgeCriterionDTO of badgeCriteriaDTO) {
      if (badgeCriterionDTO.scope === SCOPES.CAMPAIGN_PARTICIPATION) {
        criteria.push(
          new BadgeCriterion({
            ...badgeCriterionDTO,
            skillSets: [],
            cappedTubes: [],
          })
        );
      }
      if (badgeCriterionDTO.scope === SCOPES.CAPPED_TUBES) {
        const cappedTubes = [];
        for (const cappedTubeDTO of badgeCriterionDTO.cappedTubes) {
          cappedTubes.push(
            new CappedTube({
              tubeId: cappedTubeDTO.id,
              level: cappedTubeDTO.level,
            })
          );
        }
        criteria.push(
          new BadgeCriterion({
            ...badgeCriterionDTO,
            skillSets: [],
            cappedTubes,
          })
        );
      }
    }
    badges.push(
      new BadgeDetails({
        ...badgeDTO,
        criteria,
      })
    );
  }
  return badges;
}
