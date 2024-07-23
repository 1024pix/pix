import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationCourseResult } from '../../domain/models/ComplementaryCertificationCourseResult.js';

const getPixSourceResultByComplementaryCertificationCourseId = async function ({ complementaryCertificationCourseId }) {
  const result = await knex
    .select('*')
    .from('complementary-certification-course-results')
    .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.PIX })
    .first();

  if (!result) return null;

  return ComplementaryCertificationCourseResult.from(result);
};

const getAllowedJuryLevelIdsByComplementaryCertificationBadgeId = async function ({
  complementaryCertificationBadgeId,
}) {
  return knex
    .pluck('complementary-certification-badges.id')
    .from('badges')
    .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where(
      'targetProfileId',
      '=',
      knex('badges')
        .select('targetProfileId')
        .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
        .where({ 'complementary-certification-badges.id': complementaryCertificationBadgeId })
        .first(),
    )
    .orderBy('complementary-certification-badges.level', 'asc');
};

const removeExternalJuryResult = async function ({ complementaryCertificationCourseId }) {
  await knex('complementary-certification-course-results')
    .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.EXTERNAL })
    .delete();
};

const save = async function ({
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  acquired,
  source,
}) {
  return knex('complementary-certification-course-results')
    .insert({ complementaryCertificationBadgeId, acquired, complementaryCertificationCourseId, source })
    .onConflict(['complementaryCertificationCourseId', 'source'])
    .merge();
};

export {
  getAllowedJuryLevelIdsByComplementaryCertificationBadgeId,
  getPixSourceResultByComplementaryCertificationCourseId,
  removeExternalJuryResult,
  save,
};
