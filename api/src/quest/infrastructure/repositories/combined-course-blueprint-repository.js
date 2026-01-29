import difference from 'lodash/difference.js';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { CombinedCourseBlueprint } from '../../domain/models/CombinedCourseBlueprint.js';

/**
 * @returns {Promise<import('../../domain/models/CombinedCourseBlueprint.js').CombinedCourseBlueprint[]>}
 */

export async function findAll() {
  const knexConn = DomainTransaction.getConnection();

  const results = await knexConn('combined_course_blueprints');
  return results.map((data) => new CombinedCourseBlueprint(data));
}

export async function save({ combinedCourseBlueprint }) {
  const knexConn = DomainTransaction.getConnection();

  if (!combinedCourseBlueprint.id) {
    const [insertedValues] = await knexConn('combined_course_blueprints')
      .insert(_toDTO({ combinedCourseBlueprint }))
      .returning('*');

    return new CombinedCourseBlueprint(insertedValues);
  }

  const [updatedValues] = await knexConn('combined_course_blueprints')
    .update(_toDTO({ combinedCourseBlueprint }))
    .where({ id: combinedCourseBlueprint.id })
    .returning('*');
  await updateShares({ combinedCourseBlueprint, knexConn });

  return new CombinedCourseBlueprint({
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
    .select({
      id: 'combined_course_blueprints.id',
      name: 'combined_course_blueprints.name',
      internalName: 'combined_course_blueprints.internalName',
      description: 'combined_course_blueprints.description',
      illustration: 'combined_course_blueprints.illustration',
      content: 'combined_course_blueprints.content',
      createdAt: 'combined_course_blueprints.createdAt',
      updatedAt: 'combined_course_blueprints.updatedAt',
      organizationIds: knex.raw(`array_remove(array_agg("combined_course_blueprint_shares"."organizationId"), NULL)`),
    })
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
  return new CombinedCourseBlueprint(result);
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
  };
}
