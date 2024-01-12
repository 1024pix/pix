import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Center } from '../../domain/models/Center.js';

const getById = async ({ id }) => {
  const certificationCenter = await knex
    .select({
      id: 'certification-centers.id',
      type: 'certification-centers.type',
      habilitations: knex.raw(
        'array_agg("complementary-certification-habilitations"."complementaryCertificationId" order by "complementary-certification-habilitations"."complementaryCertificationId")',
      ),
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .where('certification-centers.id', '=', id)
    .groupBy('certification-centers.id')
    .first();
  if (!certificationCenter) {
    throw new NotFoundError(`Certification center not found`);
  }
  return _toDomain(certificationCenter);
};

export { getById };

function _toDomain(row) {
  return new Center({
    ...row,
  });
}
