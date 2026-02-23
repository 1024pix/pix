import difference from 'lodash/difference.js';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { CombinedCourseBlueprint } from '../../domain/models/CombinedCourseBlueprint.js';

/**
 * @returns {Promise<import('../../domain/models/CombinedCourseBlueprint.js').CombinedCourseBlueprint[]>}
 */

export async function findAll() {
  const knexConn = DomainTransaction.getConnection();

  const results = await knexConn('combined_course_blueprints');
  return results.map(_toDomain);
}

export async function save({ combinedCourseBlueprint }) {
  const knexConn = DomainTransaction.getConnection();

  if (!combinedCourseBlueprint.id) {
    const [insertedValues] = await knexConn('combined_course_blueprints')
      .insert(_toDTO({ combinedCourseBlueprint }))
      .returning('*');

    return _toDomain(insertedValues);
  }

  const [updatedValues] = await knexConn('combined_course_blueprints')
    .update(_toDTO({ combinedCourseBlueprint }))
    .where({ id: combinedCourseBlueprint.id })
    .returning('*');
  await updateShares({ combinedCourseBlueprint, knexConn });

  return _toDomain({
    ...updatedValues,
    organizationIds: combinedCourseBlueprint.organizationIds,
  });
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
    await knexConn('combined_course_blueprint_shares').delete().whereIn('organizationId', organizationIdsToRemove);
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
  return _toDomain(result);
}

export async function findByOrganizationId({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('combined_course_blueprints')
    .select(_buildSelectFields(knexConn))
    .join(
      'combined_course_blueprint_shares',
      'combined_course_blueprints.id',
      'combined_course_blueprint_shares.combinedCourseBlueprintId',
    )
    .where({ organizationId })
    .groupBy('combined_course_blueprints.id');
  return results.map(_toDomain);
}

function _toDTO({ combinedCourseBlueprint }) {
  return {
    id: combinedCourseBlueprint.id,
    name: combinedCourseBlueprint.name,
    internalName: combinedCourseBlueprint.internalName,
    description: combinedCourseBlueprint.description,
    illustration: combinedCourseBlueprint.illustration,
    content: JSON.stringify(combinedCourseBlueprint.content),
    createdAt: combinedCourseBlueprint.createdAt,
    updatedAt: combinedCourseBlueprint.updatedAt,
    questId: combinedCourseBlueprint.questId,
  };
}

function _toDomain(rawData) {
  return new CombinedCourseBlueprint({
    id: rawData.id,
    name: rawData.name,
    internalName: rawData.internalName,
    description: rawData.description,
    illustration: rawData.illustration,
    content: rawData.content,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    organizationIds: rawData.organizationIds,
    questId: rawData.questId,
  });
}

function _buildSelectFields(knexConn) {
  return {
    id: 'combined_course_blueprints.id',
    name: 'combined_course_blueprints.name',
    internalName: 'combined_course_blueprints.internalName',
    description: 'combined_course_blueprints.description',
    illustration: 'combined_course_blueprints.illustration',
    content: 'combined_course_blueprints.content',
    createdAt: 'combined_course_blueprints.createdAt',
    updatedAt: 'combined_course_blueprints.updatedAt',
    organizationIds: knexConn.raw(`array_remove(array_agg("combined_course_blueprint_shares"."organizationId"), NULL)`),
    questId: 'combined_course_blueprints.questId',
  };
}
