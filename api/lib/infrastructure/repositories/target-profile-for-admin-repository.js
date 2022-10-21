const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError, TargetProfileInvalidError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const areaRepository = require('./area-repository');
const competenceRepository = require('./competence-repository');
const targetProfileRepository = require('./target-profile-repository');
const thematicRepository = require('./thematic-repository');
const tubeRepository = require('./tube-repository');
const skillRepository = require('./skill-repository');
const challengeRepository = require('./challenge-repository');
const TargetProfileForAdminOldFormat = require('../../domain/models/TargetProfileForAdminOldFormat');
const TargetProfileForAdminNewFormat = require('../../domain/models/TargetProfileForAdminNewFormat');

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
    if (_.isEmpty(tubesData)) {
      // OLD target profile
      const skillIds = await targetProfileRepository.getTargetProfileSkillIds(targetProfileDTO.id);
      if (_.isEmpty(skillIds)) {
        throw new TargetProfileInvalidError();
      }
      return _toDomainOldFormat(targetProfileDTO, skillIds, locale);
    }
    return _toDomainNewFormat(targetProfileDTO, tubesData, locale);
  },
};

async function _toDomainOldFormat(targetProfileDTO, skillIds, locale) {
  const { areas, competences, tubes, skills } = await _getLearningContent_old(skillIds, locale);

  return new TargetProfileForAdminOldFormat({
    ...targetProfileDTO,
    areas,
    competences,
    tubes,
    skills,
  });
}

async function _toDomainNewFormat(targetProfileDTO, tubesData, locale) {
  const { areas, competences, thematics, tubes } = await _getLearningContent_new(
    targetProfileDTO.id,
    tubesData,
    locale
  );

  return new TargetProfileForAdminNewFormat({
    ...targetProfileDTO,
    areas,
    competences,
    thematics,
    tubes,
  });
}

async function _getLearningContent_old(skillIds, locale) {
  const skills = await skillRepository.findOperativeByIds(skillIds);
  const tubeIds = _.keys(_.groupBy(skills, 'tubeId'));
  const tubes = await tubeRepository.findByRecordIds(tubeIds, locale);

  const competenceIds = _.keys(_.groupBy(tubes, 'competenceId'));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const allAreas = _.map(competences, (competence) => competence.area);
  const uniqAreas = _.uniqBy(allAreas, 'id');

  return {
    areas: uniqAreas,
    competences,
    tubes,
    skills,
  };
}

async function _getLearningContent_new(targetProfileId, tubesData, locale) {
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

  const competenceIds = _.keys(_.groupBy(tubes, 'competenceId'));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const thematicIds = competences.flatMap((competence) => competence.thematicIds);
  const uniqThematicIds = _.uniq(thematicIds);
  const allCompetenceThematics = await thematicRepository.findByRecordIds(uniqThematicIds, locale);
  const thematics = allCompetenceThematics.filter((thematic) =>
    thematic.tubeIds.some((tubeId) => tubeIds.includes(tubeId))
  );

  const areaIds = _.map(competences, (competence) => competence.areaId);
  const uniqAreaIds = _.uniq(areaIds);
  const areas = await areaRepository.findByRecordIds({ areaIds: uniqAreaIds, locale });

  const challenges = await challengeRepository.findValidatedPrototype();

  for (const tube of tubes) {
    const tubeData = tubesData.find((data) => tube.id === data.tubeId);
    tube.level = tubeData.level;
    const correspondingThematic = thematics.find((thematic) => thematic.tubeIds.includes(tube.id));
    tube.thematicId = correspondingThematic.id;
    const tubeChallenges = challenges.filter((challenge) => {
      return challenge.skill.tubeId === tube.id;
    });
    tube.mobile = tubeChallenges && tubeChallenges.length > 0 && tubeChallenges.every((c) => c.isMobileCompliant);
    tube.tablet = tubeChallenges && tubeChallenges.length > 0 && tubeChallenges.every((c) => c.isTabletCompliant);
  }

  return {
    areas,
    competences,
    thematics,
    tubes,
  };
}
