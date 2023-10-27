import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { LOCALE } from '../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE } = LOCALE;

import * as areaRepository from './area-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as thematicRepository from './thematic-repository.js';
import * as tubeRepository from './tube-repository.js';
import * as skillRepository from './skill-repository.js';
import { TargetProfileForAdmin } from '../../domain/models/index.js';
import { StageCollection } from '../../domain/models/target-profile-management/StageCollection.js';
import { BadgeDetails, BadgeCriterion, CappedTube, SCOPES } from '../../domain/models/BadgeDetails.js';

const get = async function ({ id, locale = FRENCH_FRANCE }) {
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
      'target-profiles.isSimplifiedAccess',
      'target-profiles.areKnowledgeElementsResettable',
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
};

export { get };

async function _toDomain(targetProfileDTO, tubesData, locale) {
  const { areas, competences, thematics, tubes, skills } = await _getLearningContent(
    targetProfileDTO.id,
    tubesData,
    locale,
  );
  const badges = await _findBadges(targetProfileDTO.id);
  const stageCollection = await _getStageCollection(targetProfileDTO.id);
  const hasLinkedCampaign = await _hasLinkedCampaign(targetProfileDTO.id);

  return new TargetProfileForAdmin({
    ...targetProfileDTO,
    badges,
    stageCollection,
    areas,
    competences,
    thematics,
    tubes,
    skills,
    hasLinkedCampaign,
  });
}

async function _getLearningContent(targetProfileId, tubesData, locale) {
  const tubeIds = tubesData.map((data) => data.tubeId);
  const tubes = await tubeRepository.findByRecordIds(tubeIds, locale);
  const notFoundTubeIds = tubeIds.filter((id) => !tubes.map((tube) => tube.id).includes(id));
  if (notFoundTubeIds.length > 0) {
    throw new NotFoundError(
      `Les sujets [${notFoundTubeIds.join(
        ', ',
      )}] du profil cible ${targetProfileId} n'existent pas dans le référentiel.`,
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

  const skillIds = _.uniq(_.flatten(_.map(tubes, 'skillIds')));
  const skills = await skillRepository.findActiveByRecordIds(skillIds);

  return {
    areas,
    competences,
    thematics,
    tubes,
    skills,
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
            cappedTubes: [],
          }),
        );
      }
      if (badgeCriterionDTO.scope === SCOPES.CAPPED_TUBES) {
        const cappedTubes = [];
        for (const cappedTubeDTO of badgeCriterionDTO.cappedTubes) {
          cappedTubes.push(
            new CappedTube({
              tubeId: cappedTubeDTO.id,
              level: cappedTubeDTO.level,
            }),
          );
        }
        criteria.push(
          new BadgeCriterion({
            ...badgeCriterionDTO,
            cappedTubes,
          }),
        );
      }
    }
    badges.push(
      new BadgeDetails({
        ...badgeDTO,
        criteria,
      }),
    );
  }
  return badges;
}

async function _getStageCollection(targetProfileId) {
  const stages = await knex('stages').where({ targetProfileId }).orderBy('id', 'asc');
  const { max: maxLevel } = await knex('target-profile_tubes')
    .max('level')
    .where('targetProfileId', targetProfileId)
    .first();

  return new StageCollection({ id: targetProfileId, stages, maxLevel });
}

async function _hasLinkedCampaign(targetProfileId) {
  const campaigns = await knex('campaigns').where({ targetProfileId }).first();

  return Boolean(campaigns);
}
