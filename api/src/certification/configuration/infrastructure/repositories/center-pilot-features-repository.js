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

  return _toDomain({ centerId, features: data.features });
};

/**
 * @param {Object} params
 * @param {CenterPilotFeatures} params.centerPilotFeatures
 * @returns {void}
 */

function _toDomain({ centerId, features = [] }) {
  const centerPilotFeatures = new CenterPilotFeatures({
    centerId,
    isComplementaryAlonePilot: features.find(
      (featureKey) => featureKey === CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
    ),
  });

  return centerPilotFeatures;
}
