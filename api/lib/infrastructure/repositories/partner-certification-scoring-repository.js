import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { BookshelfComplementaryCertificationCourseResult } from '../orm-models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationCourseResult } from '../../domain/models/ComplementaryCertificationCourseResult.js';

const save = async function ({
  partnerCertificationScoring,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const partnerCertificationToSave = new BookshelfComplementaryCertificationCourseResult(
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
};

export { save };

function _adaptModelToDB({ complementaryCertificationCourseId, partnerKey, source, acquired }) {
  return { complementaryCertificationCourseId, partnerKey, source, acquired };
}
