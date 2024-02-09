import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Center } from '../../domain/models/Center.js';

const getById = async ({ id }) => {
  const center = await knex
    .select({
      id: 'certification-centers.id',
      type: 'certification-centers.type',
      habilitations: knex.raw(
        'array_remove(array_agg("complementary-certification-habilitations"."complementaryCertificationId" order by "complementary-certification-habilitations"."complementaryCertificationId"), NULL)',
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

  if (!center) {
    throw new NotFoundError('Center not found');
  }

  return _toDomain(center);
};

export { getById };

function _toDomain(row) {
  return new Center(row);
}
