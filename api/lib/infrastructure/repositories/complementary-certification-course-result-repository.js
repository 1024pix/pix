import ComplementaryCertificationCourseResult from '../../domain/models/ComplementaryCertificationCourseResult';
import { knex } from '../../../db/knex-database-connection';

export default {
  async getPixSourceResultByComplementaryCertificationCourseId({ complementaryCertificationCourseId }) {
    const result = await knex
      .select('*')
      .from('complementary-certification-course-results')
      .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.PIX })
      .first();

    if (!result) return null;

    return ComplementaryCertificationCourseResult.from(result);
  },

  async getAllowedJuryLevelByBadgeKey({ key }) {
    return knex('badges')
      .pluck('key')
      .where('targetProfileId', '=', knex('badges').select('targetProfileId').where({ key }));
  },

  async save({ complementaryCertificationCourseId, partnerKey, acquired, source }) {
    return knex('complementary-certification-course-results')
      .insert({ partnerKey, acquired, complementaryCertificationCourseId, source })
      .onConflict(['complementaryCertificationCourseId', 'source'])
      .merge();
  },
};
