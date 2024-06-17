import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { Center } from '../../domain/models/Center.js';
import { Habilitation } from '../../domain/models/Habilitation.js';

const getById = async ({ id }) => {
  const center = await knex
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      habilitations: knex.raw(
        `json_agg(json_build_object(
        'complementaryCertificationId', "complementary-certification-habilitations"."complementaryCertificationId",
        'key', "complementary-certifications"."key",
        'label', "complementary-certifications"."label"
        ))`,
      ),
      features: knex.raw('array_remove(array_agg("certificationCenterFeatures"."key"), NULL)'),
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
      isV3Pilot: 'certification-centers.isV3Pilot',
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .leftJoin(
      _getCertificationCenterFeatures({ id }),
      'certification-centers.id',
      'certificationCenterFeatures.certificationCenterId',
    )
    .leftJoin(
      function () {
        this.select('certificationCenterId')
          .from('certification-center-features')
          .innerJoin('features', function () {
            this.on('certification-center-features.featureId', 'features.id').andOnVal(
              'features.key',
              CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
            );
          })
          .as('complementaryCertificationAloneFeature');
      },
      'complementaryCertificationAloneFeature.certificationCenterId',
      'certification-centers.id',
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
  return new Center({
    id: row.id,
    name: row.name,
    externalId: row.externalId,
    isV3Pilot: row.isV3Pilot,
    type: row.type,
    habilitations: _toDomainHabilitation(row.habilitations),
    features: row.features,
  });
}

function _toDomainHabilitation(complementaryCertificationHabilitations = []) {
  return complementaryCertificationHabilitations
    .filter((data) => !!data.complementaryCertificationId)
    .map(
      ({ complementaryCertificationId, key, label }) => new Habilitation({ complementaryCertificationId, key, label }),
    );
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
