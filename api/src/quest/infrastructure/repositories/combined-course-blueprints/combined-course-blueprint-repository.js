import difference from 'lodash/difference.js';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CombinedCourseBlueprint } from '../../../domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { Quest } from '../../../domain/models/quests/entities/Quest.js';
import * as questRepository from '../quest-repository.js';

/**
 * @returns {Promise<import('../../../domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js').CombinedCourseBlueprint[]>}
 */

export async function findAll() {
  const knexConn = DomainTransaction.getConnection();

  const results = await knexConn('combined_course_blueprints');

  const blueprints = [];
  for (const result of results) {
    const quest = await questRepository.findById({ questId: result.questId });
    blueprints.push(_toDomain(result, quest));
  }
  return blueprints;
}

export async function save({ combinedCourseBlueprint }) {
  const knexConn = DomainTransaction.getConnection();

  const questId = await questRepository.save({ quest: combinedCourseBlueprint.quest });

  const blueprintToSave = {
    id: combinedCourseBlueprint.id,
    name: combinedCourseBlueprint.name,
    internalName: combinedCourseBlueprint.internalName,
    description: combinedCourseBlueprint.description,
    illustration: combinedCourseBlueprint.illustration,
    rewardRequirementsDescription: combinedCourseBlueprint.rewardRequirements,
    surveyUrl: combinedCourseBlueprint.surveyLink,
    updatedAt: knexConn.fn.now(),
    questId,
  };

  const createdBlueprint = await knexConn('combined_course_blueprints')
    .insert(blueprintToSave)
    .onConflict('id')
    .merge([
      'updatedAt',
      'name',
      'internalName',
      'description',
      'illustration',
      'rewardRequirementsDescription',
      'surveyUrl',
      'questId',
    ])
    .returning('*');

  const doesCombinedCourseBlueprintExists = !!combinedCourseBlueprint.id;
  if (doesCombinedCourseBlueprintExists) {
    await updateShares({ combinedCourseBlueprint, knexConn });
  }

  const quest = await questRepository.findById({ questId });

  return _toDomain({ ...createdBlueprint[0], organizationIds: combinedCourseBlueprint.organizationIds }, quest);
}

async function updateShares({ combinedCourseBlueprint, knexConn }) {
  const currentCombinedCourseBlueprint = await findById({ id: combinedCourseBlueprint.id });
  if (!currentCombinedCourseBlueprint) {
    throw new NotFoundError(`No combined course blueprint found with id ${combinedCourseBlueprint.id}`);
  }

  const organizationIdsToRemove = difference(
    currentCombinedCourseBlueprint.organizationIds,
    combinedCourseBlueprint.organizationIds,
  );

  const organizationIdsToAdd = difference(
    combinedCourseBlueprint.organizationIds,
    currentCombinedCourseBlueprint.organizationIds,
  );

  if (organizationIdsToRemove.length > 0) {
    await knexConn('combined_course_blueprint_shares')
      .delete()
      .where('combinedCourseBlueprintId', currentCombinedCourseBlueprint.id)
      .whereIn('organizationId', organizationIdsToRemove);
  }

  if (organizationIdsToAdd.length > 0) {
    for (const organizationId of organizationIdsToAdd) {
      await knexConn('combined_course_blueprint_shares').insert({
        organizationId,
        combinedCourseBlueprintId: currentCombinedCourseBlueprint.id,
      });
    }
  }
}

export async function findById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('combined_course_blueprints')
    .select(_buildSelectFields(knexConn))
    .leftJoin(
      'combined_course_blueprint_shares',
      'combined_course_blueprints.id',
      'combined_course_blueprint_shares.combinedCourseBlueprintId',
    )
    .groupBy('combined_course_blueprints.id')
    .where('combined_course_blueprints.id', id)
    .first();

  if (!result) {
    return null;
  }
  const quest = await questRepository.findById({ questId: result.questId });
  return _toDomain(result, quest);
}

export async function findByOrganizationId({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const combinedCoursesWithQuests = await knexConn('combined_course_blueprints')
    .select({
      ..._buildSelectFields(knexConn),
      questRewardId: 'quests.rewardId',
      questRewardType: 'quests.rewardType',
      questEligibilityRequirements: 'quests.eligibilityRequirements',
      questSuccessRequirements: 'quests.successRequirements',
      questCreatedAt: 'quests.createdAt',
      questUpdatedAt: 'quests.updatedAt',
    })
    .join(
      'combined_course_blueprint_shares',
      'combined_course_blueprints.id',
      'combined_course_blueprint_shares.combinedCourseBlueprintId',
    )
    .join('quests', 'quests.id', 'combined_course_blueprints.questId')
    .where({ organizationId })
    .groupBy('combined_course_blueprints.id', 'quests.id')
    .orderBy('combined_course_blueprints.id');

  return combinedCoursesWithQuests.map((result) => {
    const quest = new Quest({
      id: result.questId,
      rewardId: result.questRewardId,
      rewardType: result.questRewardType,
      eligibilityRequirements: result.questEligibilityRequirements,
      successRequirements: result.questSuccessRequirements,
      createdAt: result.questCreatedAt,
      updatedAt: result.questUpdatedAt,
    });
    return _toDomain(result, quest);
  });
}

function _toDomain(rawData, quest) {
  return new CombinedCourseBlueprint({
    id: rawData.id,
    name: rawData.name,
    internalName: rawData.internalName,
    description: rawData.description,
    illustration: rawData.illustration,
    content: rawData.content,
    surveyLink: rawData.surveyUrl,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    organizationIds: rawData.organizationIds,
    rewardRequirements: rawData.rewardRequirementsDescription,
    quest,
  });
}

function _buildSelectFields(knexConn) {
  return {
    id: 'combined_course_blueprints.id',
    name: 'combined_course_blueprints.name',
    internalName: 'combined_course_blueprints.internalName',
    description: 'combined_course_blueprints.description',
    illustration: 'combined_course_blueprints.illustration',
    surveyUrl: 'combined_course_blueprints.surveyUrl',
    rewardRequirementsDescription: 'combined_course_blueprints.rewardRequirementsDescription',
    createdAt: 'combined_course_blueprints.createdAt',
    updatedAt: 'combined_course_blueprints.updatedAt',
    organizationIds: knexConn.raw(`array_remove(array_agg("combined_course_blueprint_shares"."organizationId"), NULL)`),
    questId: 'combined_course_blueprints.questId',
  };
}
