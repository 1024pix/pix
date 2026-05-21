import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { REWARD_TYPES } from '../../domain/constants.js';
import { Attestation } from '../../domain/models/Attestation.js';

const ATTESTATION_KEY_UNIQUE_CONSTRAINT = 'attestations_key_unique';
const DUPLICATE_ATTESTATION_KEY = 'DUPLICATE_ATTESTATION_KEY';

export const save = async ({ templateName, templateKey, templateFile, label, attestationStorage }) => {
  await DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();

    try {
      await knexConn('attestations').insert({ key: templateKey, templateName, label });
      await attestationStorage.startUpload({ filename: `${templateName}.pdf`, readableStream: templateFile });
    } catch (error) {
      if (knexUtils.isUniqConstraintViolated(error) && error.constraint === ATTESTATION_KEY_UNIQUE_CONSTRAINT) {
        throw new AlreadyExistingEntityError(error.detail, DUPLICATE_ATTESTATION_KEY);
      }
      throw error;
    }
  });
};

export const getAllByOrganizationId = async ({ organizationId }) => {
  const knexConn = DomainTransaction.getConnection();

  const organizationAttestationManagementFeature = await knexConn('organization-features')
    .select('params')
    .where('featureId', (qb) => {
      qb.select('id').from('features').where('key', ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key).first();
    })
    .andWhere('organizationId', organizationId)
    .first();

  const attestations = await knexConn('attestations')
    .select('id', 'key', 'label')
    .whereIn('key', organizationAttestationManagementFeature.params);

  return attestations.map((attestation) => new Attestation(attestation));
};

export const getByRewardId = async ({ rewardId, rewardApi }) => {
  return rewardApi.getByIdAndType({ rewardId, rewardType: REWARD_TYPES.ATTESTATION });
};
