import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { CombinedCourse } from '../../domain/models/combined-courses/entities/CombinedCourse.js';
import { Quest } from '../../domain/models/quests/entities/Quest.js';

const getByCode = async ({ code }) => {
  const knexConn = DomainTransaction.getConnection();

  const combinedCourse = await _baseQuery(knexConn).where('code', code).first();
  if (!combinedCourse) {
    throw new NotFoundError(`Le parcours combiné portant le code ${code} n'existe pas`);
  }

  return _toDomain(combinedCourse);
};

const getById = async ({ id }) => {
  const knexConn = DomainTransaction.getConnection();

  const combinedCourse = await _baseQuery(knexConn)
    .where('combined_courses.id', id)
    .whereNotNull('organizationId')
    .whereNotNull('code')
    .first();
  if (!combinedCourse) {
    throw new NotFoundError(`Le parcours combiné pour l'id ${id} n'existe pas`);
  }

  return _toDomain(combinedCourse);
};

const findByOrganizationId = async ({ organizationId, page, size }) => {
  const knexConn = DomainTransaction.getConnection();

  const queryBuilder = _baseQuery(knexConn)
    .where('organizationId', organizationId)
    .orderBy('combined_courses.createdAt', 'desc');

  const { results, pagination } = await fetchPage({
    queryBuilder,
    paginationParams: { number: page, size },
  });

  return {
    combinedCourses: results.map(_toDomain),
    meta: pagination,
  };
};

const findByCampaignId = async ({ campaignId }) => {
  const knexConn = DomainTransaction.getConnection();
  const combinedCourses = await _baseQuery(knexConn)
    .where('combined_courses.organizationId', knexConn('campaigns').select('organizationId').where('id', campaignId))
    .whereJsonSupersetOf('quests.successRequirements', [{ data: { campaignId: { data: campaignId } } }]);

  return combinedCourses.map((combinedCourse) => _toDomain(combinedCourse));
};

const _baseQuery = (knexConn) => {
  return knexConn('combined_courses')
    .select(
      'combined_courses.id',
      'combined_courses.organizationId',
      'combined_courses.code',
      'combined_courses.name',
      'combined_courses.description',
      'combined_courses.illustration',
      'combined_courses.combinedCourseBlueprintId',
      'combined_courses.createdAt',
      'combined_courses.updatedAt',
      'combined_courses.deletedAt',
      'combined_courses.deletedBy',
      'combined_courses.questId',
      'quests.createdAt as questCreatedAt',
      'quests.updatedAt as questUpdatedAt',
      'quests.rewardType as questRewardType',
      'quests.eligibilityRequirements as questEligibilityRequirements',
      'quests.successRequirements as questSuccessRequirements',
      'quests.rewardId as questRewardId',
      'combined_course_blueprints.surveyUrl as baseSurveyUrl',
    )
    .join('quests', 'quests.id', 'combined_courses.questId')
    .leftJoin(
      'combined_course_blueprints',
      'combined_course_blueprints.id',
      'combined_courses.combinedCourseBlueprintId',
    )
    .whereNull('combined_courses.deletedAt');
};

const targetProfileIdsPartOfAnyCombinedCourse = async ({ targetProfileIds }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('campaigns')
    .select('campaigns.targetProfileId')
    .whereIn('campaigns.targetProfileId', targetProfileIds)
    .whereIn(
      'campaigns.id',
      knexConn('quests').select(
        knexConn.raw('jsonb_path_query("successRequirements", \'$.data.campaignId.data\')::integer'),
      ),
    )
    .pluck('campaigns.targetProfileId');
};

const saveInBatch = async ({ combinedCourses, questRepository }) => {
  const knexConn = DomainTransaction.getConnection();
  const combinedCoursesToSave = combinedCourses.map(_toDTO);
  const questsToSave = combinedCourses.map((combinedCourse) => combinedCourse.quest);
  const questIds = await questRepository.saveInBatch({ quests: questsToSave });

  for (let i = 0; i < questIds.length; i++) {
    await knexConn('combined_courses').insert({ ...combinedCoursesToSave[i], questId: questIds[i] });
  }
};

const save = async ({ combinedCourse, questRepository }) => {
  const knexConn = DomainTransaction.getConnection();
  const combinedCourseToSave = _toDTO(combinedCourse);
  const questId = await questRepository.save({ quest: combinedCourse.quest });
  const [{ id: createdCombinedCourseId }] = await knexConn('combined_courses')
    .insert({ ...combinedCourseToSave, questId })
    .returning('id');

  return getById({ id: createdCombinedCourseId });
};

const _toDTO = (combinedCourse) => {
  return {
    combinedCourseBlueprintId: combinedCourse.blueprintId,
    organizationId: combinedCourse.organizationId,
    code: combinedCourse.code,
    name: combinedCourse.name,
    description: combinedCourse.description,
    illustration: combinedCourse.illustration,
  };
};

const findByModuleIdAndOrganizationIds = async ({ moduleId, organizationIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const combinedCourses = await _baseQuery(knexConn)
    .whereIn('combined_courses.organizationId', organizationIds)
    .whereJsonSupersetOf('quests.successRequirements', [{ data: { moduleId: { data: moduleId } } }]);

  return combinedCourses.map(_toDomain);
};

const deleteCombinedCourses = async ({ combinedCourseIds, deletedBy }) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('combined_courses')
    .update({ deletedAt: knexConn.fn.now(), deletedBy, updatedAt: knexConn.fn.now() })
    .whereIn('id', combinedCourseIds);
};

const updateCombinedCourses = async ({ combinedCourseIds, name }) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('combined_courses').update({ name, updatedAt: knexConn.fn.now() }).whereIn('id', combinedCourseIds);
};

const _toDomain = ({
  id,
  organizationId,
  code,
  name,
  description,
  illustration,
  questId,
  combinedCourseBlueprintId,
  deletedAt,
  deletedBy,
  questCreatedAt,
  questUpdatedAt,
  questRewardType,
  questEligibilityRequirements,
  questSuccessRequirements,
  questRewardId,
  baseSurveyUrl,
}) => {
  return new CombinedCourse(
    {
      id,
      organizationId,
      code,
      name,
      description,
      illustration,
      questId,
      blueprintId: combinedCourseBlueprintId,
      baseSurveyUrl,
      deletedAt,
      deletedBy,
    },
    new Quest({
      id: questId,
      createdAt: questCreatedAt,
      updatedAt: questUpdatedAt,
      rewardType: questRewardType,
      eligibilityRequirements: questEligibilityRequirements,
      successRequirements: questSuccessRequirements,
      rewardId: questRewardId,
    }),
  );
};

export {
  deleteCombinedCourses,
  findByCampaignId,
  findByModuleIdAndOrganizationIds,
  findByOrganizationId,
  getByCode,
  getById,
  save,
  saveInBatch,
  targetProfileIdsPartOfAnyCombinedCourse,
  updateCombinedCourses,
};
