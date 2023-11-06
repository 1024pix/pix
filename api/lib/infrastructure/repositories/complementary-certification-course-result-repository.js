import { ComplementaryCertificationCourseResult } from '../../domain/models/ComplementaryCertificationCourseResult.js';
import { knex } from '../../../db/knex-database-connection.js';

const getPixSourceResultByComplementaryCertificationCourseId = async function ({ complementaryCertificationCourseId }) {
  const result = await knex
    .select('*')
    .from('complementary-certification-course-results')
    .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.PIX })
    .first();

  if (!result) return null;

  return ComplementaryCertificationCourseResult.from(result);
};

const getAllowedJuryLevelByBadgeKey = async function ({ key }) {
  return knex('badges')
    .pluck('key')
    .where('targetProfileId', '=', knex('badges').select('targetProfileId').where({ key }));
};

const save = async function ({
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  partnerKey,
  acquired,
  source,
}) {
  return knex('complementary-certification-course-results')
    .insert({ partnerKey, complementaryCertificationBadgeId, acquired, complementaryCertificationCourseId, source })
    .onConflict(['complementaryCertificationCourseId', 'source'])
    .merge();
};

const removeExternalJuryResult = async function ({ complementaryCertificationCourseId }) {
  await knex('complementary-certification-course-results')
    .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.EXTERNAL })
    .delete();
};

export {
  getPixSourceResultByComplementaryCertificationCourseId,
  getAllowedJuryLevelByBadgeKey,
  save,
  removeExternalJuryResult,
};
