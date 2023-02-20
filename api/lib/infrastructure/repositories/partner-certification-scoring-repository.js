import { knex } from '../../../db/knex-database-connection';
import DomainTransaction from '../DomainTransaction';
import ComplementaryCertificationCourseResultBookshelf from '../orm-models/ComplementaryCertificationCourseResult';
import ComplementaryCertificationCourseResult from '../../domain/models/ComplementaryCertificationCourseResult';

export default {
  async save({ partnerCertificationScoring, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const partnerCertificationToSave = new ComplementaryCertificationCourseResultBookshelf(
      _adaptModelToDB({
        ...partnerCertificationScoring,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        complementaryCertificationCourseId: partnerCertificationScoring.complementaryCertificationCourseId,
        acquired: partnerCertificationScoring.isAcquired(),
      })
    );

    const complementaryCertificationCourseResult = await knex
      .select('id')
      .from('complementary-certification-course-results')
      .where({
        complementaryCertificationCourseId: partnerCertificationScoring.complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        source: partnerCertificationScoring.source,
      })
      .first();

    if (complementaryCertificationCourseResult) {
      return partnerCertificationToSave
        .query(function (qb) {
          qb.where({
            id: complementaryCertificationCourseResult.id,
          });
        })
        .save(null, { transacting: domainTransaction.knexTransaction, method: 'update' });
    }

    return partnerCertificationToSave.save(null, { transacting: domainTransaction.knexTransaction, method: 'insert' });
  },
};

function _adaptModelToDB({ complementaryCertificationCourseId, partnerKey, source, acquired }) {
  return { complementaryCertificationCourseId, partnerKey, source, acquired };
}
