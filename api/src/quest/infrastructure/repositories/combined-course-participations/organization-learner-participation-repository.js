import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CombinedCourseParticipation } from '../../../domain/models/combined-course-participations/entities/CombinedCourseParticipation.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';

export const findByOrganizationLearnerIdAndModuleIds = async ({ organizationLearnerId, moduleIds }) => {
  const participationById = await findByOrganizationLearnerIdsAndModuleIds({
    organizationLearnerIds: [organizationLearnerId],
    moduleIds,
  });
  const participations = participationById.get(organizationLearnerId);
  if (!participations) return [];
  return participations;
};

export const findByOrganizationLearnerIdsAndModuleIds = async ({ organizationLearnerIds, moduleIds }) => {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('organization_learner_participations')
    .select('organization_learner_participations.*') // TODO: refactor to select only the required columns instead of *
    .where({ type: OrganizationLearnerParticipationTypes.PASSAGE })
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .whereIn('referenceId', moduleIds)
    .whereNull('deletedAt');

  const organizationLearnerParticipations = result.map(
    (moduleParticipation) => new OrganizationLearnerParticipation(moduleParticipation),
  );
  return Map.groupBy(
    organizationLearnerParticipations,
    (moduleParticipation) => moduleParticipation.organizationLearnerId,
  );
};

export const synchronize = async ({ organizationLearnerId, moduleIds, modulesApi, organizationLearnerApi }) => {
  if (moduleIds.length === 0) {
    return;
  }

  const knexConn = DomainTransaction.getConnection();

  const learner = await organizationLearnerApi.get(organizationLearnerId);
  const modulePassages = await modulesApi.getUserModuleStatuses({ userId: learner.userId, moduleIds });

  const learnerParticipationsByModule = await knexConn('organization_learner_participations')
    .select('organization_learner_participations.id', 'referenceId')
    .where('organizationLearnerId', organizationLearnerId)
    .whereIn('referenceId', moduleIds);

  const updatedParticipations = [];

  for (const modulePassage of modulePassages) {
    const learnerParticipationModule = learnerParticipationsByModule.find(
      (learnerParticipation) => learnerParticipation.referenceId === modulePassage.id,
    );

    const { id: organizationLearnerParticipationId, ...organizationLearnerPassageParticipation } =
      OrganizationLearnerParticipation.buildFromPassage({
        id: learnerParticipationModule?.id,
        organizationLearnerId,
        createdAt: modulePassage.createdAt,
        status: modulePassage.status,
        updatedAt: modulePassage.updatedAt,
        terminatedAt: modulePassage.terminatedAt,
        moduleId: modulePassage.id,
      });

    updatedParticipations.push(new OrganizationLearnerParticipation(organizationLearnerPassageParticipation));

    if (organizationLearnerParticipationId) {
      await knexConn('organization_learner_participations')
        .update(organizationLearnerPassageParticipation)
        .where('id', organizationLearnerParticipationId);
    } else {
      await knexConn('organization_learner_participations').insert(organizationLearnerPassageParticipation);
    }
  }

  return updatedParticipations;
};

export const deleteCombinedCourseParticipationByCombinedCourseIdAndOrganizationLearnerId = async ({
  combinedCourseId,
  userId,
  organizationLearnerId,
}) => {
  const knexConn = DomainTransaction.getConnection();

  await baseUpdateQuery(knexConn, userId)
    .where('organizationLearnerId', organizationLearnerId)
    .andWhere('referenceId', combinedCourseId.toString());
};

export const deleteCombinedCourseParticipations = async ({ combinedCourseIds, userId }) => {
  const knexConn = DomainTransaction.getConnection();

  const stringifiedCombinedCourseIds = combinedCourseIds.map((id) => id.toString());
  await baseUpdateQuery(knexConn, userId).whereIn(
    'organization_learner_participations.referenceId',
    stringifiedCombinedCourseIds,
  );
};

function baseUpdateQuery(knexConn, userId) {
  return knexConn('organization_learner_participations').update({
    deletedAt: knexConn.fn.now(),
    deletedBy: userId,
    updatedAt: knexConn.fn.now(),
  });
}

export const saveCombinedCourseParticipation = async function ({ organizationLearnerId, combinedCourseId }) {
  const knexConnection = DomainTransaction.getConnection();

  const existingCombinedCourse = await knexConnection('organization_learner_participations')
    .where({
      referenceId: combinedCourseId.toString(),
      organizationLearnerId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    })
    .first();

  if (existingCombinedCourse) return;

  await knexConnection('organization_learner_participations')
    .insert({
      organizationLearnerId,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      referenceId: combinedCourseId,
    })
    .returning('id');
};

/**
 * @param {number} participationId
 * @returns {Promise<CombinedCourseParticipation | null>}
 */
export const findCombinedCourseParticipationById = async function ({ participationId }) {
  const knexConnection = DomainTransaction.getConnection();
  const combinedCourseParticipation = await knexConnection('organization_learner_participations')
    .select('organization_learner_participations.id', 'organizationLearnerId')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'organization_learner_participations.organizationLearnerId',
    )
    .where({
      'organization_learner_participations.id': participationId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    })
    .whereNull('organization_learner_participations.deletedAt')
    .first();
  if (!combinedCourseParticipation) return null;
  return new CombinedCourseParticipation(combinedCourseParticipation);
};

/**
 * @param {number} combinedCourseId
 * @param {number} participationId
 * @returns {Promise<boolean>}
 */
export const isParticipationOnCombinedCourse = async function ({ combinedCourseId, participationId }) {
  const knexConnection = DomainTransaction.getConnection();
  const { count } = await knexConnection('organization_learner_participations')
    .select(knexConnection.raw('count(1)'))
    .where({
      referenceId: combinedCourseId.toString(),
      'organization_learner_participations.id': participationId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    })
    .first();
  return Boolean(count);
};

export const findByLearnerId = async function ({ organizationLearnerId, combinedCourseId }) {
  const participation = await findByLearnerIds({
    organizationLearnerIds: [organizationLearnerId],
    combinedCourseId,
  });
  if (participation.length > 0) return participation[0];
  return null;
};

export const findByLearnerIds = async function ({ organizationLearnerIds, combinedCourseId }) {
  const knexConnection = DomainTransaction.getConnection();
  const results = await knexConnection('organization_learner_participations')
    .select(
      'organization_learner_participations.id',
      'organizationLearnerId',
      'organization_learner_participations.status',
      'organization_learner_participations.createdAt',
      'organization_learner_participations.updatedAt',
      'organization_learner_participations.referenceId',
    )
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      '=',
      'organization_learner_participations.organizationLearnerId',
    )
    .whereIn('view-active-organization-learners.id', organizationLearnerIds)
    .where({
      'organization_learner_participations.referenceId': combinedCourseId.toString(),
      'organization_learner_participations.type': OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    })
    .whereNull('organization_learner_participations.deletedAt')
    .orderBy([{ column: 'organization_learner_participations.createdAt', order: 'desc' }]);

  return results.map((row) => new OrganizationLearnerParticipation(row));
};

export const findPaginatedCombinedCourseParticipationById = async function ({ combinedCourseId, page, filters }) {
  const knexConnection = DomainTransaction.getConnection();

  const queryBuilder = knexConnection('organization_learner_participations')
    .select('view-active-organization-learners.id', 'view-active-organization-learners.userId')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'organization_learner_participations.organizationLearnerId',
    )
    .where({
      referenceId: combinedCourseId.toString(),
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
    })
    .whereNull('organization_learner_participations.deletedAt')
    .orderBy(['lastName', 'firstName']);
  queryBuilder.modify(addSearchFilters, filters);
  const { results, pagination } = await fetchPage({ queryBuilder, paginationParams: page });
  return {
    organizationLearners: results.map((result) => ({ id: result.id, userId: result.userId })),
    meta: pagination,
  };
};

function addSearchFilters(queryBuilder, filters = {}) {
  if (filters.fullName) {
    filterByFullName(queryBuilder, filters.fullName, 'firstName', 'lastName');
  }
  if (filters.statuses?.length > 0) {
    queryBuilder.whereIn('organization_learner_participations.status', filters.statuses);
  }
  if (filters.divisions?.length > 0) {
    queryBuilder.whereIn('view-active-organization-learners.division', filters.divisions);
  }
  if (filters.groups?.length > 0) {
    queryBuilder.whereIn('view-active-organization-learners.group', filters.groups);
  }
}

export const update = async function ({ id, ...updateFields }) {
  const knexConnection = DomainTransaction.getConnection();
  const updatedRow = await knexConnection('organization_learner_participations')
    .where({ id })
    .update(updateFields)
    .returning('*');
  return new OrganizationLearnerParticipation(updatedRow[0]);
};

/**
 * @param {[number]} combinedCourseIds
 * @returns {Promise<[CombinedCourseParticipation]>}
 */
export const findByCombinedCourseIds = async ({ combinedCourseIds }) => {
  const knexConnection = DomainTransaction.getConnection();
  const results = await knexConnection('organization_learner_participations')
    .select('organization_learner_participations.status', 'organization_learner_participations.referenceId')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'organization_learner_participations.organizationLearnerId',
    )
    .whereIn(
      'organization_learner_participations.referenceId',
      combinedCourseIds.map((combinedCourseId) => combinedCourseId.toString()),
    )
    .where('organization_learner_participations.type', OrganizationLearnerParticipationTypes.COMBINED_COURSE)
    .whereNull('organization_learner_participations.deletedAt');

  return results.map((participation) => new CombinedCourseParticipation(participation));
};
