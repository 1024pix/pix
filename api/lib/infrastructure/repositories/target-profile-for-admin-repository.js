import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import { NotFoundError, TargetProfileInvalidError } from '../../domain/errors';
import { LOCALE } from '../../domain/constants';

const { FRENCH_FRANCE: FRENCH_FRANCE } = LOCALE;

import areaRepository from './area-repository';
import competenceRepository from './competence-repository';
import targetProfileRepository from './target-profile-repository';
import thematicRepository from './thematic-repository';
import tubeRepository from './tube-repository';
import skillRepository from './skill-repository';
import TargetProfileForAdminOldFormat from '../../domain/models/TargetProfileForAdminOldFormat';
import TargetProfileForAdminNewFormat from '../../domain/models/TargetProfileForAdminNewFormat';
import { BadgeDetails, BadgeCriterion, SkillSet, CappedTube, SCOPES } from '../../domain/models/BadgeDetails';

export default {
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
  const badges = await _findBadges(targetProfileDTO.id);
  return new TargetProfileForAdminOldFormat({
    ...targetProfileDTO,
    badges,
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
  const badges = await _findBadges(targetProfileDTO.id);

  return new TargetProfileForAdminNewFormat({
    ...targetProfileDTO,
    badges,
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

  const areaIds = _.keys(_.groupBy(competences, 'areaId'));
  const areas = await areaRepository.findByRecordIds({ areaIds, locale });

  return {
    areas,
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
      if (badgeCriterionDTO.scope === SCOPES.SKILL_SET) {
        const skillSetsDTO = await knex('skill-sets')
          .select('name', 'skillIds')
          .whereIn('id', badgeCriterionDTO.skillSetIds);
        const skillSets = [];
        for (const { name, skillIds } of skillSetsDTO) {
          skillSets.push(new SkillSet({ name, skillIds }));
        }
        criteria.push(
          new BadgeCriterion({
            ...badgeCriterionDTO,
            skillSets,
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
