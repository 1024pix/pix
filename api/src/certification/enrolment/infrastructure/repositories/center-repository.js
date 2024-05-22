import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Center } from '../../../enrolment/domain/models/Center.js';

const getById = async ({ id }) => {
  const center = await knex
    .select({
      id: 'certification-centers.id',
      type: 'certification-centers.type',
      habilitations: knex.raw(
        'array_remove(array_agg("complementary-certification-habilitations"."complementaryCertificationId" order by "complementary-certification-habilitations"."complementaryCertificationId"), NULL)',
      ),
      features: knex.raw('array_remove(array_agg("certificationCenterFeatures"."key"), NULL)'),
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .leftJoin(
      _getCertificationCenterFeatures({ id }),
      'certification-centers.id',
      'certificationCenterFeatures.certificationCenterId',
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

function _getCertificationCenterFeatures({ id }) {
  return (builder) => {
    return builder
      .select('certification-center-features.certificationCenterId', 'features.key')
      .from('certification-center-features')
      .innerJoin('features', 'features.id', 'certification-center-features.featureId')
      .where('certification-center-features.certificationCenterId', '=', id)
      .as('certificationCenterFeatures');
  };
}
