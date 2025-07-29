import _ from 'lodash';

import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { TargetProfileForAdmin } from '../../../../prescription/target-profile/domain/models/TargetProfileForAdmin.js';
import { constants } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError, ObjectValidationError } from '../../../../shared/domain/errors.js';
import { BadgeCriterion, BadgeDetails, CappedTube, SCOPES } from '../../../../shared/domain/models/BadgeDetails.js';
import { TargetProfile } from '../../../../shared/domain/models/index.js';
import { StageCollection } from '../../../../shared/domain/models/target-profile-management/StageCollection.js';
import { FRENCH_FRANCE } from '../../../../shared/domain/services/locale-service.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../../shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { TargetProfileSummaryForAdmin } from '../../domain/models/TargetProfileSummaryForAdmin.js';

const TARGET_PROFILE_TABLE = 'target-profiles';

const get = async function ({ id, locale = FRENCH_FRANCE }) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfileDTO = await knexConn('target-profiles')
    .select(
      'target-profiles.id',
      'target-profiles.name',
      'target-profiles.internalName',
      'target-profiles.outdated',
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

  const tubesData = await knexConn('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', targetProfileDTO.id);

  const targetProfileEstimatedTimes = await datamartKnex('target_profiles_course_duration')
    .select('quantile_75')
    .where({ targetProfileId: id })
    .first();

  return _toDomain(targetProfileDTO, tubesData, targetProfileEstimatedTimes?.quantile_75, locale);
};

const update = async function (targetProfile) {
  let results;
  const editedAttributes = _.pick(targetProfile, [
    'name',
    'internalName',
    'outdated',
    'description',
    'comment',
    'isSimplifiedAccess',
  ]);

  try {
    results = await knex('target-profiles')
      .where({ id: targetProfile.id })
      .update(editedAttributes)
      .returning(['id', 'isSimplifiedAccess']);
  } catch {
    throw new ObjectValidationError();
  }

  if (!results.length) {
    throw new NotFoundError(`Le profil cible avec l'id ${targetProfile.id} n'existe pas`);
  }

  return new TargetProfile(results[0]);
};

const create = async function ({ targetProfileForCreation }) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfileRawData = _.pick(targetProfileForCreation, [
    'name',
    'internalName',
    'category',
    'description',
    'comment',
    'imageUrl',
    'ownerOrganizationId',
    'areKnowledgeElementsResettable',
  ]);
  const [{ id: targetProfileId }] = await knexConn(TARGET_PROFILE_TABLE).insert(targetProfileRawData).returning('id');

  const tubesData = targetProfileForCreation.tubes.map((tube) => ({
    targetProfileId,
    tubeId: tube.id,
    level: tube.level,
  }));
  await knex.batchInsert('target-profile_tubes', tubesData).transacting(knexConn.isTransaction ? knexConn : null);

  return targetProfileId;
};

const getTubesByTargetProfileId = async (targetProfileId) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('target-profile_tubes').select('tubeId', 'level').where('targetProfileId', targetProfileId);
};

const findByOrganization = async function ({ organizationId }) {
  const results = await knex('target-profiles')
    .select({
      id: 'target-profiles.id',
      internalName: 'target-profiles.internalName',
      outdated: 'target-profiles.outdated',
      ownerOrganizationId: 'target-profiles.ownerOrganizationId',
      sharedOrganizationId: 'target-profile-shares.organizationId',
    })
    .leftJoin('target-profile-shares', function () {
      this.on('target-profile-shares.targetProfileId', 'target-profiles.id').on(
        'target-profile-shares.organizationId',
        organizationId,
      );
    })
    .where({ outdated: false })
    .where((qb) => {
      qb.orWhere({ ownerOrganizationId: organizationId });
      qb.orWhere((subQb) => {
        subQb.whereNotNull('target-profile-shares.id');
      });
    })
    .orderBy('id', 'ASC');

  return results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
};

async function _toDomain(targetProfileDTO, tubesData, targetProfileEstimatedTimes, locale) {
  const { areas, competences, thematics, tubes, skills } = await _getLearningContent(
    targetProfileDTO.id,
    tubesData,
    locale,
  );
  const badges = await _findBadges(targetProfileDTO.id);
  const stageCollection = await _getStageCollection(targetProfileDTO.id);
  const hasLinkedCampaign = await _hasLinkedCampaign(targetProfileDTO.id);
  const hasLinkedAutonomousCourse = await _hasLinkedAutonomousCourse(targetProfileDTO, hasLinkedCampaign);

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
    hasLinkedAutonomousCourse,
    estimatedTime: targetProfileEstimatedTimes,
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

async function _hasLinkedAutonomousCourse(targetProfile, hasLinkedCampaign) {
  const targetProfileSharesLinkedWithAutonomousCourseOrganization = await knex('target-profile-shares')
    .where({
      targetProfileId: targetProfile.id,
      organizationId: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
    })
    .first();

  const isLinkedWithAutonomousCourseOrga =
    targetProfile.ownerOrganizationId === constants.AUTONOMOUS_COURSES_ORGANIZATION_ID ||
    Boolean(targetProfileSharesLinkedWithAutonomousCourseOrganization);
  const isSimplifiedAccess = Boolean(targetProfile.isSimplifiedAccess);

  return hasLinkedCampaign && isLinkedWithAutonomousCourseOrga && isSimplifiedAccess;
}

export { create, findByOrganization, get, getTubesByTargetProfileId, update };
