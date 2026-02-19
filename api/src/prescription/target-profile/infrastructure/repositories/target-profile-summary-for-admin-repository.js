import * as combinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-course-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { TargetProfileSummaryForAdmin } from '../../domain/models/TargetProfileSummaryForAdmin.js';

const findPaginatedFiltered = async function ({ filter, page }) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn('target-profiles')
    .select('id', 'internalName', 'outdated', 'category', 'createdAt')
    .orderBy('outdated', 'ASC')
    .orderBy('internalName', 'ASC')
    .modify(_applyFilters, filter);

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const targetProfileSummaries = results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
  return { models: targetProfileSummaries, meta: { ...pagination } };
};

const findByTraining = async function ({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();

  const targetProfiles = await knexConn('target-profiles')
    .select({
      id: 'target-profiles.id',
      internalName: 'target-profiles.internalName',
      outdated: 'target-profiles.outdated',
    })
    .innerJoin('target-profile-trainings', 'target-profiles.id', 'target-profile-trainings.targetProfileId')
    .where({ trainingId })
    .orderBy('id', 'ASC');

  const targetProfileIds = targetProfiles.map((result) => result.id);

  const targetProfilesPartOfAnyCombinedCourse = await combinedCourseRepository.targetProfileIdsPartOfAnyCombinedCourse({
    targetProfileIds,
  });

  return targetProfiles.map((result) => {
    return new TargetProfileSummaryForAdmin({
      ...result,
      isPartOfCombinedCourse: targetProfilesPartOfAnyCombinedCourse.includes(result.id),
    });
  });
};

export { findByTraining, findPaginatedFiltered };

function _applyFilters(qb, filter) {
  const { internalName, id, categories } = filter;
  if (internalName) {
    qb.whereILike('internalName', `%${internalName}%`);
  }
  if (id) {
    qb.where({ id });
  }
  if (categories) {
    qb.whereIn('category', categories);
  }
  return qb;
}
