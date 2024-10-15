import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Attestation } from '../../domain/models/Attestation.js';

export const getByKey = async ({ attestationKey }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const attestation = await knexConnection('attestations').where({ key: attestationKey }).first();

  if (!attestation) return null;

  return new Attestation(attestation);
};
