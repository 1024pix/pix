import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { CenterPilotFeatures } from '../../domain/models/CenterPilotFeatures.js';

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @returns {CenterPilotFeatures}
 */
export const getByCenterId = async function ({ centerId }) {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification-centers')
    .select({
      id: 'certification-centers.id',
      features: knexConn.raw('array_remove(array_agg(DISTINCT "features"."key"), NULL)'),
      isV3Pilot: 'certification-centers.isV3Pilot',
    })
    .leftJoin(
      'certification-center-features',
      'certification-centers.id',
      'certification-center-features.certificationCenterId',
    )
    .leftJoin('features', 'features.id', 'certification-center-features.featureId')
    .where('certification-centers.id', '=', centerId)
    .groupBy('certification-centers.id')
    .first();

  if (!data) {
    throw new NotFoundError('Center not found');
  }

  return _toDomain({ centerId, features: data.features, isV3Pilot: data.isV3Pilot });
};

/**
 * @param {Object} params
 * @param {CenterPilotFeatures} params.centerPilotFeatures
 * @returns {void}
 */
export const update = async function ({ centerPilotFeatures }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isV3Pilot: centerPilotFeatures.isV3Pilot, updatedAt: knexConn.fn.now() })
    .where({ id: centerPilotFeatures.centerId });
};

function _toDomain({ centerId, features = [], isV3Pilot }) {
  const centerPilotFeatures = new CenterPilotFeatures({
    centerId,
    isV3Pilot,
    isComplementaryAlonePilot: features.find(
      (featureKey) => featureKey === CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
    ),
  });

  return centerPilotFeatures;
}
